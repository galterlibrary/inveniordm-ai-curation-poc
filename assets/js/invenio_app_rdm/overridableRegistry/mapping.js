import axios from "axios";
import _isEmpty from "lodash/isEmpty"
import _uniqBy from "lodash/uniqBy";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FastField, Field, getIn } from "formik";
import { FieldLabel, RichInputField } from "react-invenio-forms";

import { RDMDepositRecordSerializer } from "./DepositRecordSerializer";
import { SubjectsFieldWithAI } from "./SubjectsField";


function getFieldErrors(form, fieldPath) {
  return (
    getIn(form.errors, fieldPath, null) || getIn(form.initialErrors, fieldPath, null)
  );
};


function getFormSlice(formValues, fieldPath) {
  return getIn(formValues, fieldPath, []);
};



function addToRemoteSelectField(form) {
  console.log("addToRemoteSelectField");
  const fieldPath = "metadata.subjects";

  const subjects = getIn(form.values, fieldPath, []);

  const newSubject = {
    id: "https://id.nlm.nih.gov/mesh/D001650Q000097",
    key: "Bile Duct Neoplasms/blood",
    subject: "Bile Duct Neoplasms/blood",
    text: "\u2728 (MeSH) Bile Duct Neoplasms/blood",
    value: "Bile Duct Neoplasms/blood",
  }

  form.setFieldValue(
    fieldPath,
    _uniqBy(
      [...subjects, newSubject],
      "value"
    )
  );

};


/**
 * API client response.
 */
export class DepositApiClientResponse {
  constructor(data, errors) {
    this.data = data;
    this.errors = errors;
  }
}


class AiApiClient {

  aiURL = "/ai-poc-1";

  constructor(serializer) {
    this.serializer = serializer;

    this.apiConfig = {
      withCredentials: true,
      xsrfCookieName: "csrftoken",
      xsrfHeaderName: "X-CSRFToken",
      headers: { "Content-Type": "application/json" },
    };
    this.axiosWithConfig = axios.create(this.apiConfig);
    this.cancelToken = axios.CancelToken;
  }

  async _createResponse(axiosRequest) {
    try {
      const response = await axiosRequest();
      console.log("response");
      console.dir(response);
      const data = this.serializer.deserialize(response.data || {});
      const errors = this.serializer.deserializeErrors(
        response.data.errors || []
      );
      return new DepositApiClientResponse(data, errors);
    } catch (error) {
      // This is actually for a truly exceptional problem
      console.log("error");
      console.dir(error);
      const errorData = error.response.data;
      throw new DepositApiClientResponse({}, errorData);
    }
  }

  /**
   * Does AI.
   *
   * @param {object} draft - draft to serialize
   */
  async doAI(draft) {
    const payload = this.serializer.serialize(draft);
    return this._createResponse(() =>
      this.axiosWithConfig.post(
        this.aiURL,
        payload,
      )
    );
  }

}


function DescriptionsFieldWithAI(props) {
  // Formik props
  const { children, field, form } = props;

  // Application props
  const { fieldPath, label, labelIcon, options, editorConfig, recordUI } = props;

  // // static contextType = DepositFormSubmitContext;

  // handleReservePID = (event, formik) => {
  //   const { pidType } = this.props;
  //   const { setSubmitContext } = this.context;
  //   setSubmitContext(DepositFormSubmitActions.RESERVE_PID, {
  //     pidType: pidType,
  //   });
  //   formik.handleSubmit(event);
  // };

  // const { setSubmitContext } = this.context;

  // State
  let [doneAI, setDoneAI] = useState({});

  // Redux state
  const state = useSelector(state => state);

  // Derived
  const hasDoneAI = !_isEmpty(doneAI);

  // const draft = getDraftData(); // TODO

  const doAI = async () => {
    const recordSerializer = new RDMDepositRecordSerializer(
      state.deposit.config.default_locale,
      state.deposit.config.custom_fields.vocabularies
    );

    const client = new AiApiClient(
      recordSerializer
    );

    console.log("calling AI");

    // make backend call
    const response = await client.doAI(form.values);

    // update doneAI with result
    if (!_isEmpty(response.errors)) {
      console.log("AI enhancement error");
      console.log(JSON.stringify(response.errors));
      return;
    }

    addToRemoteSelectField(form);

    let result = {
      "sent": form.values,
      "received": response.data
    };

    console.log("Got response");
    console.log(result);
    setDoneAI(result);

    console.log("Done AI");
  }

  return (
    <>
      <RichInputField
        className="description-field rel-mb-1"
        fieldPath={fieldPath}
        editorConfig={editorConfig}
        label={<FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />}
        optimized
      />

      <button onClick={doAI}>Do AI</button>

      { hasDoneAI && (
          <div>
            <br/>
            <div>Done AI</div>
            <br />
          </div>
        )
      }

      <br/>
    </>
  );
}

function FormikDescriptionsFieldWithAI(props) {
  return (
    <Field component={DescriptionsFieldWithAI} {...props} />
  );
}


export const overriddenComponents = {
  "InvenioAppRdm.Deposit.DescriptionsField.layout": FormikDescriptionsFieldWithAI,
  "InvenioAppRdm.Deposit.SubjectsField.layout": SubjectsFieldWithAI
};
