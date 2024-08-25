import React from 'react'

const DropDown = ({ label, dependsOn, name, options, ifOtherThenSpecify, responsibleForRendering, formData, setFormData }) => {

    function handleChange(event) {
        setFormData((prevData) => {
            return {
                ...prevData,
                [name]: event.target.value
            };
        });
    }

    return (
        <div className="dropdownContainer isWide ">
            <label>{label}</label>
            <select
                name={name}
                onChange={handleChange}
                value={formData[name]}
            >
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {ifOtherThenSpecify && formData[name] === "Other" && (
                <input
                    type="text"
                    placeholder="Please specify"
                    name={`${name}Other`}
                    onChange={handleChange}
                />
            )}
        </div>
    );
}

export default DropDown;