import React, { useEffect } from 'react';

const wideFieldNames = [
    'applicantFullName',
    'applicantEmail',
    'applicantRollNo',
    'applicantDepartment',
    'primarySupervisorFullName',
    'primarySupervisorEmail',
    'primarySupervisorContact',
    'primarySupervisorDepartment',
    'anotherSupervisorFullName',
    'anotherSupervisorEmail',
    'anotherSupervisorContact',
    'anotherSupervisorDepartment',
    'purposeOfTravel',
    'purposeOfTravelOther',
    'modeOfTravel',
    'modeOfTravelOther',
    'proofOfTravel',
    'accomodationOpted',
    'typeOfAccomodation',
    'proofOfAccomodation',
    'eventName',
    'eventDate',
    'eventWebsite',
    'proofOfAttendance',
    'fatherFullName',
    'fatherContact',
    'motherFullName',
    'motherContact'
];

const almostFullRowNeeded = [
    'accomodationAddress',
    'eventVenue',
    'applicantAddress',
];

const fullRowNeeded = [
    'anyOtherRequirements',
];

const regularSpan = [
    'applicantAge',
    'applicantRollNo',
    'applicantDepartment',
    'applicantContact'
];


const LabelAndInputField = (props) => {
    function handleChange(event) {
        props.setFormData((prevData) => ({
            ...prevData,
            [props.name]: event.target.value
        }));
    }

    function handleChangeOther(event){
        props.setFormData((prevData) => ({
            ...prevData,
            [props.name]: event.target.value
        }));
    }

    useEffect(() => {
        if (almostFullRowNeeded.includes(props.name) || fullRowNeeded.includes(props.name)) {
            const textareas = document.querySelectorAll('.labelAndInputField textarea');

            textareas.forEach(function(textarea) {
                textarea.style.boxSizing = 'border-box'; 
                textarea.addEventListener('input', function() {
                    textarea.style.height = 'auto';
                    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px'; 
                });
            });
        }
    }, [props.name]);

    return (
        <>
            {props.label ? (
                <div className={`labelAndInputField ${wideFieldNames.includes(props.name) ? "isWide" : ""} ${almostFullRowNeeded.includes(props.name) ? "almostFullRowFieldForLabel" : ""} ${fullRowNeeded.includes(props.name) ? "fullRowFieldForLabel" : ""} ${regularSpan.includes(props.name) ? "regularSpan" : ""}`}>
                    <label className='label'>{props.label}</label>
                    <textarea className='input' onChange={handleChange} name={props.name} />
                </div>
            ) : (
                <input className='justInputElement' type="text" placeholder='If Other then Specify' onChange={handleChangeOther} name={props.name} />
            )}
        </>
    );
}

export default LabelAndInputField;
