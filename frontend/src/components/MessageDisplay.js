import React from 'react';

const MessageDisplay = ({ message, type }) => {
    if (!message) return null;

    const baseStyle = "p-3 rounded-lg text-center mb-4";
    const successStyle = "bg-green-100 text-green-700 border border-green-200";
    const errorStyle = "bg-red-100 text-red-700 border border-red-200";
    const infoStyle = "bg-blue-100 text-blue-700 border border-blue-200";

    let style = baseStyle;
    if (type === 'success') {
        style += ` ${successStyle}`;
    } else if (type === 'error') {
        style += ` ${errorStyle}`;
    } else { // Default to info
        style += ` ${infoStyle}`;
    }

    return (
        <div className={style}>
            {message}
        </div>
    );
};

export default MessageDisplay;
