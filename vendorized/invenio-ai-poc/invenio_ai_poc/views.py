# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Northwestern University.
#
# invenio-ai-poc is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, render_template, session


blueprint = Blueprint(
    "invenio_ai_poc",  # Flask endpoint prefix (not url prefix)
    __name__,  # helps determine root_path that resources are relative to
    template_folder="templates/"
)


# STOPPED HERE add post
@blueprint.route("/ai-poc-1")
def ai_poc_1():
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
