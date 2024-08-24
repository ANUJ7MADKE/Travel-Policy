import React from 'react';

const IndividualRadioButtons = ({ label, value, name, formData, onChange ,checked }) => {
  return (
    <>
      <input 
        type="radio" 
        value={value}
        name={name}
        checked={checked}
        onChange={onChange}
      />
      {label}
    </>
  );
}

export default IndividualRadioButtons;