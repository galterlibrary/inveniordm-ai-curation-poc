// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020-2023 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _uniqBy from "lodash/uniqBy";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, getIn } from "formik";
import { FieldLabel, GroupField } from "react-invenio-forms";
import { Form } from "semantic-ui-react";
// import { i18next } from "@translations/i18next";

import { RemoteSelectField } from "./RemoteSelectField";


export class SubjectsFieldWithAI extends Component {
  state = {
    limitTo: "all",
  };

  serializeSubjects = (subjects) => {
    console.log("serializeSubjects called");
    console.dir(subjects);
    return subjects.map((subject) => {
      const scheme = subject.scheme ? `(${subject.scheme}) ` : "";
      return {
        ...(subject.id ? { id: subject.id } : {}),
        key: subject.subject,
        subject: subject.subject,
        text: scheme + subject.subject,
        value: subject.subject,
      };
    });
  };

  prepareSuggest = (searchQuery) => {
    const { limitTo } = this.state;

    const prefix = limitTo === "all" ? "" : `${limitTo}:`;
    return `${prefix}${searchQuery}`;
  };

  getRemoteSelectValues = (values, fieldPath) => {
    return getIn(values, fieldPath, []).map((val) => {
      return val.subject;
    });
  };

  convertSelectedToValue = (selected) => {
    return selected.map((s) => s.subject);
  }

  getFormSlice = (formValues, fieldPath) => {
    return getIn(formValues, fieldPath, []);
  };

  addToRemoteSelectField = (form, fieldPath) => {
    console.log("addToRemoteSelectField");

    const subjects = this.getFormSlice(form.values, fieldPath);

    const newSubject = {
      id: "https://id.nlm.nih.gov/mesh/D001650Q000097",
      key: "Bile Duct Neoplasms/blood",
      subject: "Bile Duct Neoplasms/blood",
      text: "(MeSH) Bile Duct Neoplasms/blood",
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

  render() {
    const {
      fieldPath,
      label,
      labelIcon,
      required,
      multiple,
      placeholder,
      clearable,
      limitToOptions,
    } = this.props;

    return (
      <GroupField className="main-group-field">
        <Form.Field width={5} className="subjects-field">
          <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
          <GroupField>
            <Form.Field
              width={8}
              style={{ marginBottom: "auto", marginTop: "auto" }}
              className="p-0"
            >
              {"Suggest from"}
            </Form.Field>
            <Form.Dropdown
              className="p-0"
              defaultValue={limitToOptions[0].value}
              fluid
              onChange={(event, data) => this.setState({ limitTo: data.value })}
              options={limitToOptions}
              selection
              width={8}
            />
          </GroupField>
        </Form.Field>
        <Field name={fieldPath}>
          {({ form } ) => {
            console.log("fieldPath", fieldPath);

            const selectedOptions = this.getFormSlice(form.values, fieldPath);

            return (
              <>
                <RemoteSelectField
                  // UI
                  clearable={clearable}
                  fieldPath={fieldPath}
                  multiple={multiple}
                  noQueryMessage={"Search or create subjects..."}
                  placeholder={placeholder}
                  required={required}
                  label={
                    <>
                      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                      <label className="mobile-hidden">&nbsp;</label>
                    </>
                  } /** For alignment purposes */
                  allowAdditions
                  width={11}

                  // business logic
                  suggestionAPIUrl="/api/subjects"
                  selected={selectedOptions}
                  convertSelectedToValue={this.convertSelectedToValue}
                  preSearchChange={this.prepareSuggest}
                  serializeSuggestions={this.serializeSubjects}
                  serializeAddedValue={(value) => {
                    return {
                      text: value,
                      value: value,
                      key: value,
                      subject: value,
                    };
                  }}
                  onValueChange={({ formikProps }, selectedSuggestions) => {
                    console.log("onValueChange called");
                    console.log("selectedSuggestions");
                    console.dir(selectedSuggestions);
                    formikProps.form.setFieldValue(
                      fieldPath,
                      // save the suggestion objects so we can extract information
                      // about which value added by the user
                      selectedSuggestions
                    );
                  }}

                  // old
                  // initialSuggestions={getIn(values, fieldPath, [])}
                />
              </>
            );
          }}
        </Field>
      </GroupField>
    );
  }
}

SubjectsFieldWithAI.propTypes = {
  limitToOptions: PropTypes.array.isRequired,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  clearable: PropTypes.bool,
  placeholder: PropTypes.string,
};

SubjectsFieldWithAI.defaultProps = {
  required: false,
  label: "Subjects",
  labelIcon: "tag",
  multiple: true,
  clearable: true,
  placeholder: "Search for a subject by name",
};
