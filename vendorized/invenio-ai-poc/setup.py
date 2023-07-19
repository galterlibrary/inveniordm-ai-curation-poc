# -*- coding: utf-8 -*-
#
# Copyright (C) 2022-present Northwestern University.
#
# galter-prism is all rights reserved.

"""Galter Prism custom javascript for frontpage."""

from invenio_ai_poc import __version__
from setuptools import find_packages, setup

readme = open('README.md').read()

packages = find_packages()


setup(
    name='invenio-ai-poc',
    version=__version__,
    description=__doc__,
    long_description=readme,
    long_description_content_type='text/markdown',
    keywords='invenio inveniordm',
    license='All rights reserved',
    author='Northwestern University',
    author_email='DL_FSM_GDS@e.northwestern.edu',
    url='https://github.com/galterlibrary/inveniordm-ai-curation-poc',
    packages=packages,
    zip_safe=False,
    include_package_data=True,
    platforms='any',
    classifiers=[
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
    ],
)
