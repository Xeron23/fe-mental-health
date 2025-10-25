"use client";
import React, { useRef } from "react";
import { FaCalendar } from "react-icons/fa6";

const Upper = ({ setSelectedDate }) => {
  const inputRef = useRef(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.click();
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="flex flex-row justify-between items-center mb-7">
      <h1 className="text-3xl font-bold">Histori</h1>

      <div className="relative">
        <FaCalendar
          onClick={handleIconClick}
          className="text-neut-600 w-6 h-6 cursor-pointer hover:text-primary-500 transition"
        />
        <input
          ref={inputRef}
          type="date"
          onChange={handleDateChange}
          className="absolute opacity-0 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default Upper;
