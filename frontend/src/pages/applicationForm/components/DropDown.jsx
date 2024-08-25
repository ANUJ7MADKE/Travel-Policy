import React from 'react'

const DropDown = ({ label, dependsOn, name, options, ifOtherThenSpecify, responsibleForRendering, formData, setFormData }) => {
    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    return (
        <div className="dropdownContainer isWide ">
            <label>{label}</label>
            <select
                name={name}
                onChange={handleChange}
                value={formData[name] || ''}
            >
                <option value="">Select {label}</option>
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
                    value={formData[`${name}Other`] || ''}
                />
            )}
        </div>
    );
}

export default DropDown;