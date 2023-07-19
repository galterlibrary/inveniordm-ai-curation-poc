// This file is part of React-Invenio-Deposit
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _cloneDeep from "lodash/cloneDeep";
import _defaults from "lodash/defaults";
import _isArray from "lodash/isArray";
import _isBoolean from "lodash/isBoolean";
import _isEmpty from "lodash/isEmpty";
import _isNull from "lodash/isNull";
import _isNumber from "lodash/isNumber";
import _isObject from "lodash/isObject";
import _mapValues from "lodash/mapValues";
import _pick from "lodash/pick";
import _pickBy from "lodash/pickBy";
import _set from "lodash/set";
import {
  AllowAdditionsVocabularyField,
  Field,
} from "./fields";

export class DepositRecordSerializer {
  /* eslint-disable no-unused-vars */
  constructor(defaultLocale) {
    if (this.constructor === DepositRecordSerializer) {
      throw new Error("Abstract");
    }
  }

  deserialize(record) {
    throw new Error("Not implemented.");
  }
  deserializeErrors(errors) {
    throw new Error("Not implemented.");
  }
  serialize(record) {
    throw new Error("Not implemented.");
  }
}

export class RDMDepositRecordSerializer extends DepositRecordSerializer {
  constructor(defaultLocale, customFieldVocabularies = []) {
    super();
    this.defaultLocale = defaultLocale;
    this.customFieldVocabularies = customFieldVocabularies;
  }

  get depositRecordSchema() {
    return {
      description: new Field({
        fieldpath: "metadata.description",
        deserializedDefault: "",
      }),
      subjects: new AllowAdditionsVocabularyField({
        fieldpath: "metadata.subjects",
        deserializedDefault: [],
        serializedDefault: [],
        labelField: "subject",
      }),
    };
  }

  /**
   * Remove empty fields from record
   * @method
   * @param {object} obj - potentially empty object
   * @returns {object} record - without empty fields
   */
  _removeEmptyValues(obj) {
    if (_isArray(obj)) {
      let mappedValues = obj.map((value) => this._removeEmptyValues(value));
      let filterValues = mappedValues.filter((value) => {
        if (_isBoolean(value) || _isNumber(value)) {
          return value;
        }
        return !_isEmpty(value);
      });
      return filterValues;
    } else if (_isObject(obj)) {
      let mappedValues = _mapValues(obj, (value) => this._removeEmptyValues(value));
      let pickedValues = _pickBy(mappedValues, (value) => {
        if (_isArray(value) || _isObject(value)) {
          return !_isEmpty(value);
        }
        return !_isNull(value);
      });
      return pickedValues;
    }
    return _isNumber(obj) || _isBoolean(obj) || obj ? obj : null;
  }

  /**
   * Deserialize backend record into format compatible with frontend.
   * @method
   * @param {object} record - potentially empty object
   * @returns {object} frontend compatible record object
   */
  deserialize(record) {
    // NOTE: cloning nows allows us to manipulate the copy with impunity
    //       without affecting the original
    const originalRecord = _pick(_cloneDeep(record), [
      "access",
      "expanded",
      "metadata",
      "id",
      "links",
      "files",
      "is_published",
      "versions",
      "parent",
      "status",
      "pids",
      "ui",
      "custom_fields",
    ]);

    // FIXME: move logic in a more sophisticated PIDField that allows empty values
    // to be sent in the backend
    const savedPIDsFieldValue = originalRecord.pids || {};

    // Remove empty null values from record. This happens when we create a new
    // draft and the backend produces an empty record filled in with null
    // values, array of null values etc.
    // TODO: Backend should not attempt to provide empty values. It should just
    //       return existing record in case of edit or {} in case of new.
    let deserializedRecord = this._removeEmptyValues(originalRecord);

    // FIXME: Add back pids field in case it was removed
    deserializedRecord = {
      ...deserializedRecord,
      ...(!_isEmpty(savedPIDsFieldValue) ? { pids: savedPIDsFieldValue } : {}),
    };

    for (const key in this.depositRecordSchema) {
      deserializedRecord = this.depositRecordSchema[key].deserialize(
        deserializedRecord,
        this.defaultLocale
      );
    }
    return deserializedRecord;
  }

  /**
   * Deserialize backend record errors into format compatible with frontend.
   * @method
   * @param {array} errors - array of error objects
   * @returns {object} - object representing errors
   */
  deserializeErrors(errors) {
    let deserializedErrors = {};

    // TODO - WARNING: This doesn't convert backend error paths to frontend
    //                 error paths. Doing so is non-trivial
    //                 (re-using deserialize has some caveats)
    //                 Form/Error UX is tackled in next sprint and this is good
    //                 enough for now.
    for (const e of errors) {
      _set(deserializedErrors, e.field, e.messages.join(" "));
    }

    return deserializedErrors;
  }

  /**
   * Serialize record to send to the backend.
   * @method
   * @param {object} record - in frontend format
   * @returns {object} record - in API format
   *
   */
  serialize(record) {
    // NOTE: cloning nows allows us to manipulate the copy with impunity without
    //       affecting the original
    let originalRecord = _pick(_cloneDeep(record), [
      "access",
      "metadata",
      "id",
      "links",
      "files",
      "pids",
      "parent",
      "custom_fields",
    ]);

    // Save pids so they are not removed when an empty value is passed
    let savedPIDsFieldValue = originalRecord.pids || {};

    let serializedRecord = this._removeEmptyValues(originalRecord);

    for (let key in this.depositRecordSchema) {
      serializedRecord = this.depositRecordSchema[key].serialize(
        serializedRecord,
        this.defaultLocale
      );
    }

    // Remove empty values again because serialization may add some back
    serializedRecord = this._removeEmptyValues(serializedRecord);

    // Add back pids field in case it was removed
    serializedRecord = {
      ...serializedRecord,
      // always send a `pids` key even if it's empty so the backend doesn't depend on
      // the previous state.
      ...{ pids: _isEmpty(savedPIDsFieldValue) ? {} : savedPIDsFieldValue },
    };

    // Finally add back 'metadata' if absent
    // We need to do this for backend validation, unless we mark metadata as
    // required in the backend or find another alternative.
    _defaults(serializedRecord, { metadata: {}, custom_fields: {} });

    return serializedRecord;
  }
}
