import React from 'react';
import './LabelAndInputField.css';

// const personalAndAcademicFormFields = [
//     { label: 'Full Name', type: 'text', dependsOn: null, name: "applicantFullName", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Contact', type: 'text', dependsOn: null, name: "applicantContact", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label:'Age', type:'text', dependsOn:null, name:"applicantAge", options:null, ifOtherThenSpecify:false, responsibleForRendering:false, formData:formData, setFormData:setFormData},
//     { label: 'Residential Address', type: 'text', dependsOn: null, name: "applicantAddress", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Somaiya Email Id', type: 'text', dependsOn: null, name: "applicantEmail", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Roll No', type: 'text', dependsOn: null, name: "applicantRollNo", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Department', type: 'text', dependsOn: null, name: "applicantDepartment", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Supervisor\'s Full Name', type: 'text', dependsOn: null, name: "primarySupervisorFullName", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Supervisor\'s Somaiya Email Id', type: 'text', dependsOn: null, name: "primarySupervisorEmail", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Supervisor\'s Contact', type: 'text', dependsOn: null, name: "primarySupervisorContact", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Supervisor\'s Department', type: 'text', dependsOn: null, name: "primarySupervisorDepartment", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Do you have another supervisor?', type: 'selectOne', dependsOn: null, name: 'anotherSupervisor', options: ['yes', 'no'], ifOtherThenSpecify: false, responsibleForRendering: true, formData: formData, setFormData: setFormData },
//     { label: 'Other Supervisor\'s Full Name', type: 'text', dependsOn: 'anotherSupervisor', name: "anotherSupervisorFullName", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Other Supervisor\'s Somaiya Email Id', type: 'text', dependsOn: 'anotherSupervisor', name: "anotherSupervisorEmail", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Other Supervisor\'s Contact', type: 'text', dependsOn: 'anotherSupervisor', name: "anotherSupervisorContact", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
//     { label: 'Other Supervisor\'s Department', type: 'text', dependsOn: 'anotherSupervisor', name: "anotherSupervisorDepartment", options: null, ifOtherThenSpecify: false, responsibleForRendering: false, formData: formData, setFormData: setFormData },
// ];

const wideFieldLabels = [
    'Full Name',
    'Somaiya Email Id',
    'Nearest Railway Station', 
    'Supervisor/Mentors First Name', 
    'Supervisor/Mentors Last Name', 
    'Supervisor/Mentors Somaiya Email Id', 
    'Supervisor/Mentors Contact', 
    'Supervisor/Mentors Department',
    'Duration of Stay',
    'Event/Conference Name',
    'Event/Conference Date',
    'Event/Conference Website', 
    'Supervisor/Mentors Full Name',
    'Another Supervisor Full Name',
    'Another Supervisor somaiya Email Id',
    'Other Supervisor\'s Full Name',
    'Other Supervisor\'s Somaiya Email Id',
    'Other Supervisor\'s Contact',
    'Other Supervisor\'s Department',
    'Supervisor\'s Full Name',
    'Supervisor\'s Somaiya Email Id',
    'Supervisor\'s Contact',
    'Supervisor\'s Department',
    'Father\'s Full Name',
    'Father\'s Contact',
    'Mother\'s Full Name',
    'Mother\'s Contact',
];


const almostFullRowNeeded = [
    'Accomodation Address',
    'Event/Conference Venue',
    'Residential Address', 
]

const fullRowNeeded = [
    'Any Other Requirements',
]

const regularSpan = [
    'Age',
    'Roll No',
    'Department',
'Contact',
]

const LabelAndInputField = (props) => {

    function handleChange(event) {
        props.setFormData((prevData) => {
            return {
                ...prevData,
                [props.name]: event.target.value
            }
        })
    }

    return (
        <>
            {props.label ? (
                <div className={`labelAndInputField ${wideFieldLabels.includes(props.label) ? "isWide" : ""} ${almostFullRowNeeded.includes(props.label) ? "almostFullRowFieldForLabel" : ""} ${fullRowNeeded.includes(props.label) ? "fullRowFieldForLabel" : ""} ${regularSpan.includes(props.label) ? "regularSpan" : ""}`}>
                    <label className='label'  >{props.label}</label>
                    <input className='input' type="text" onChange={handleChange} name={props.name} />
                </div>
            ) : (
                <input className='justInputElement' type="text" placeholder='If Other then Specify' onChange={handleChange} name={props.name} />
            )}
        </>
    );
}

export default LabelAndInputField;
