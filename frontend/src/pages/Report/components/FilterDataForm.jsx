import React from "react";
import { Formik } from "formik";
import { useSubmit, useRouteLoaderData, useNavigation } from "react-router-dom";
import { filterDataFormFeilds } from "./FilterDataFormFeilds";
import * as yup from "yup";
import Input from "../../ApplicationForm/Input";

function FilterDataForm() {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmittingNav = navigation.state === "submitting";

  const prefilledData = null;

  // if (prefilledData) {
  //   formFields = toBeFormFields?.map((section) => {
  //     return {
  //       ...section,
  //       fields: section?.fields?.map((field) => ({
  //         ...field,
  //         disabled: true,
  //       })),
  //     };
  //   });
  // } else {
  //   formFields = toBeFormFields;
  // }

  const formFields = filterDataFormFeilds;

  const createInitialValuesScheme = (formFields) => {
    const schema = {};

    formFields?.forEach((section) => {
      section?.fields?.forEach((field) => {
        if (prefilledData) {
          if (field.type === "miniForm" || field.type === "checkbox") {
            schema[field.name] = JSON.parse(prefilledData[field.name]);
          } else {
            schema[field.name] = prefilledData[field.name];
          }
        } else if (field.type === "checkbox") {
          schema[field.name] = false;
        } else if (field.type === "miniForm") {
          schema[field.name] = [];
        } else {
          schema[field.name] = "";
        }
      });
    });

    return schema;
  };

  const initialValuesSchema = createInitialValuesScheme(formFields);

  const createValidationSchema = (formFields) => {
    const schema = {};

    formFields?.forEach((section) => {
      section.fields?.forEach((field) => {
        if (field.validation) {
          schema[field.name] = field.validation;
        }
      });
    });

    return yup.object().shape(schema);
  };

  const validationSchema = createValidationSchema(formFields);

  //this is to be handled
  const handleSubmit = async (values, { setSubmitting }) => {
    const formDataToSend = new FormData();

    for (const key in values) {
      if (key === "expenses") {
        // Serialize the expenses array as a JSON string and append
        const expenses = JSON.stringify(values[key]);
        formDataToSend.append("expenses", expenses);

        // Append expenseProof files separately (as file objects)
        values[key].forEach((expense, index) => {
          if (expense.expenseProof) {
            formDataToSend.append(
              `expenses[${index}].expenseProof`,
              expense.expenseProof
            );
          }
        });
      } else {
        // For other fields, just append normally
        formDataToSend.append(key, values[key]);
      }
    }

    // try {
    //   submit(formDataToSend, {
    //     method: "POST",
    //     encType: "multipart/form-data", // Specify the encoding type
    //   });
    // } catch (error) {
    //   console.error("Error uploading form:", error.message);
    // } finally {
    //   setSubmitting(false); // Reset the submitting state after request is done
    // }
  };

  return (
    <Formik
      initialValues={initialValuesSchema}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue, // Use setFieldValue for file handling
        isSubmitting,
      }) => (
        <form
          onSubmit={handleSubmit}
          className="bg-transparent"
        >
          <Input
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={setFieldValue} // Pass setFieldValue for file handling
            formFeilds={formFields}
          />

          {!prefilledData && (
            <button
              type="submit"
              disabled={isSubmitting || isSubmittingNav}
              className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-red-800 hover:from-red-800 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform transition duration-300 ease-in-out disabled:bg-gray-400"
            >
              {isSubmitting || isSubmittingNav ? "Gettting Data" : "Get Data"}
            </button>
          )}
        </form>
      )}
    </Formik>
  );
}

export default FilterDataForm;