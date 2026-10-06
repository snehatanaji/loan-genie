import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import pickle
import os
import joblib
from sklearn.ensemble import RandomForestClassifier

# Get the directory where the script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def predict_loan_approval(age, experience, income, family_size, ccavg, education, mortgage, securities_account, cd_account, online, credit_card):
    """
    Predict loan approval using the saved model
    
    Parameters:
    - age: Customer's age
    - experience: Years of experience
    - income: Annual income in thousands
    - family_size: Number of family members
    - ccavg: Avg. spending on credit cards per month
    - education: Education level (1: Undergrad, 2: Graduate, 3: Advanced)
    - mortgage: Value of mortgage (in thousands)
    - securities_account: Does customer have securities account? (0/1)
    - cd_account: Does customer have CD account? (0/1)
    - online: Does customer use online banking? (0/1)
    - credit_card: Does customer have a credit card? (0/1)
    
    Returns:
    - Probability of loan approval (0-1)
    """
    # Validate input parameters
    if not all(isinstance(x, (int, float)) for x in [age, experience, income, family_size, ccavg, mortgage]):
        raise ValueError("Numeric inputs must be numbers")
    if not all(x in [0, 1] for x in [securities_account, cd_account, online, credit_card]):
        raise ValueError("Binary inputs must be 0 or 1")
    if education not in [1, 2, 3]:
        raise ValueError("Education must be 1 (Undergrad), 2 (Graduate), or 3 (Advanced)")
    
    try:
        # Check if model and scaler files exist
        model_path = os.path.join(SCRIPT_DIR, 'loan_prediction_model.joblib')
        scaler_path = os.path.join(SCRIPT_DIR, 'scaler.pkl')
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            # Create and save a new model if it doesn't exist
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            scaler = StandardScaler()
            
            # Create some sample training data
            X_train = np.array([
                [35, 10, 50, 3, 2, 1, 100, 0, 0, 1, 1],  # Approved
                [45, 15, 80, 4, 3, 2, 200, 1, 1, 1, 1],  # Approved
                [25, 2, 30, 2, 1, 1, 50, 0, 0, 0, 0],    # Not approved
                [55, 25, 120, 3, 4, 3, 300, 1, 1, 1, 1], # Approved
            ])
            y_train = np.array([1, 1, 0, 1])
            
            # Fit the scaler and transform training data
            X_train_scaled = scaler.fit_transform(X_train)
            
            # Train the model
            model.fit(X_train_scaled, y_train)
            
            # Save the model and scaler
            joblib.dump(model, model_path)
            with open(scaler_path, 'wb') as f:
                pickle.dump(scaler, f)
        
        # Load the saved model and scaler
        model = joblib.load(model_path)
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        # Prepare input data
        input_data = np.array([[
            age, experience, income, family_size, ccavg, education,
            mortgage, securities_account, cd_account, online, credit_card
        ]])
        
        # Scale the input data
        scaled_input = scaler.transform(input_data)
        
        # Make prediction
        probability = model.predict_proba(scaled_input)[0][1]
        
        return float(probability)
    
    except Exception as e:
        print(f"Error making prediction: {str(e)}")
        return None

def main():
    # Example usage with user input
    print("\nWelcome to Bank Loan Approval Predictor!")
    print("Please enter customer information:")
    
    try:
        # Input collection with validation
        def get_numeric_input(prompt, min_value=None, max_value=None):
            while True:
                try:
                    value = float(input(prompt))
                    if min_value is not None and value < min_value:
                        print(f"Value must be at least {min_value}")
                        continue
                    if max_value is not None and value > max_value:
                        print(f"Value must be at most {max_value}")
                        continue
                    return value
                except ValueError:
                    print("Please enter a valid number")

        def get_binary_input(prompt):
            while True:
                try:
                    value = int(input(prompt))
                    if value not in [0, 1]:
                        print("Please enter either 0 (No) or 1 (Yes)")
                        continue
                    return value
                except ValueError:
                    print("Please enter either 0 (No) or 1 (Yes)")
        
        # Collect inputs with validation
        age = get_numeric_input("Age (18-100): ", 18, 100)
        experience = get_numeric_input("Years of experience (0-60): ", 0, 60)
        income = get_numeric_input("Annual income in thousands (10-1000): ", 10, 1000)
        family_size = get_numeric_input("Family size (1-10): ", 1, 10)
        ccavg = get_numeric_input("Average monthly credit card spending (0-10000): ", 0, 10000)
        
        print("\nEducation level:")
        print("1: Undergraduate")
        print("2: Graduate")
        print("3: Advanced/Professional")
        education = int(get_numeric_input("Enter education level (1-3): ", 1, 3))
        
        mortgage = get_numeric_input("Mortgage value in thousands (0-1000): ", 0, 1000)
        securities_account = get_binary_input("Has securities account? (0: No, 1: Yes): ")
        cd_account = get_binary_input("Has CD account? (0: No, 1: Yes): ")
        online = get_binary_input("Uses online banking? (0: No, 1: Yes): ")
        credit_card = get_binary_input("Has credit card? (0: No, 1: Yes): ")
        
        probability = predict_loan_approval(
            age, experience, income, family_size, ccavg, education,
            mortgage, securities_account, cd_account, online, credit_card
        )
        
        if probability is not None:
            print(f"\nPrediction Results:")
            print(f"Probability of loan approval: {probability:.2%}")
            if probability > 0.7:
                print("Recommendation: Strong candidate for approval")
            elif probability > 0.5:
                print("Recommendation: Moderate candidate for approval")
            else:
                print("Recommendation: May not be approved")
    
    except ValueError as e:
        print(f"Error: Please enter valid numeric values. {str(e)}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main() 