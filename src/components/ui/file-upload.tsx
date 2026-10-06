import { cn } from "../../lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone, FileRejection } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  onUpload,
  label,
  accept,
  multiple = false
}: {
  onChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => void;
  label?: string;
  accept?: string;
  multiple?: boolean;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (multiple) {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      onChange && onChange([...files, ...newFiles]);
    } else {
      setFiles([...newFiles]);
      onChange && onChange(newFiles);
    }
  };

  const handleUpload = () => {
    onUpload && onUpload(files);
  };

  const handleDiscard = () => {
    setFiles([]);
    onChange && onChange([]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    noClick: true,
    accept: accept ? { [accept]: [] } : undefined,
    onDrop: handleFileChange,
    onDropRejected: (error: FileRejection[]) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full">
      <div {...getRootProps()}>
        <motion.div
          whileHover="animate"
          className="p-6 group/file block rounded-lg cursor-pointer w-full relative"
        >
          <input
            ref={fileInputRef}
            id="file-upload-handle"
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center">
            <p className="font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
              {label || "Upload file"}
            </p>
            <p className="font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
              {multiple ? "Drag or drop your files here or click to upload multiple files" : "Drag or drop your file here or click to upload"}
            </p>
            <div className="relative w-full mt-6 max-w-xl mx-auto">
              {files.length > 0 ? (
                <>
                  {files.map((file, idx) => (
                    <motion.div
                      key={"file" + idx}
                      layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                      className={cn(
                        "relative overflow-hidden bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                        "shadow-sm"
                      )}
                    >
                      <div className="flex justify-between w-full items-center gap-4">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                        >
                          {file.name}
                        </motion.p>
                        <div className="flex items-center gap-2">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            layout
                            className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                          >
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </motion.p>
                          {multiple && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newFiles = files.filter((_, i) => i !== idx);
                                setFiles(newFiles);
                                onChange && onChange(newFiles);
                              }}
                              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                        >
                          {file.type}
                        </motion.p>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                        >
                          modified{" "}
                          {new Date(file.lastModified).toLocaleDateString()}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={handleDiscard}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Discard All
                    </button>
                    {multiple && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick();
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add More
                      </button>
                    )}
                    <button
                      onClick={handleUpload}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Upload All
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                    "border-2 border-dashed border-neutral-300 dark:border-neutral-700"
                  )}
                  onClick={handleClick}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 