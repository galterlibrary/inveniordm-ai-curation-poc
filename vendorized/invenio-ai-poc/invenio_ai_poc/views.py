# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Northwestern University.
#
# invenio-ai-poc is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, request, render_template, session


blueprint = Blueprint(
    "invenio_ai_poc",  # Flask endpoint prefix (not url prefix)
    __name__,  # helps determine root_path that resources are relative to
    template_folder="templates/"
)


@blueprint.route("/ai-poc-1", methods=["POST"])
def ai_poc_1():
    payload = request.get_json()
    print("payload")
    print(payload)
    return {
        "metadata": {
            "subjects": [{"subject": "Melon"}]
        }
    }


# @blueprint.route("/hide-banner")
# def hide_banner():
#     session['display_banner'] = False
#     return {"banner_state": "hidden"}


# @blueprint.route("/deposit-agreement")
# def deposit_agreement():
#     return render_template("galter-prism/deposit-agreement.html")
