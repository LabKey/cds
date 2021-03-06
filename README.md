# CDS

## Dataset/Assay updates
A frequent request from client is to add/modify dataset fields. There are currently 7 datasets defined for DataSpace: 1 demographics, 5 subject level assay and 1 mab assay. The dataset definitions lives in dataset xml files (MasterDataspace/study/datasets/) and are loaded to LabKey server via folder import. 

The following work are usually required to change dataset fields:
Make modification to dataset definition in dataset_metadata.xml
Add new fields, or modify existing fields label/description, etc
Re import dataset definition by uploading MasterDataspace/ and import folder.xml
Make schema, query and ETL changes for dataset change
Schema change usually is needed when new fields are to be added. There is a set of import_* tables, that the ETL import flat txt import files into, as a first step. See “CDS ETLs” section for more information.
Customize field in measure.js

Measure.js: field behavior in app
Dataset_metadata.xml defines some basic field props, such as name, description, measure, dimension, field type, etc. Fields are future decorated in measure.js to allow customized behavior in Plot (Y axis, X axis and color) and Grid variable selector. 
CDS ETLs
2 ETLs are used to load data into the app from a set of txt files. 

CDSImport.xml
This first step ETL reads txt files into a set of import_tables. When new dataset fields are requested, schema change is often needed so the import_ tables match the new fields available in the uploaded txt files.

LoadApplications.xml
This step transforms the raw data into processed data and loads to destination cds and study schema. Data processing are done in 2 ways:
Through staging queries. There are a set of queries defined over cds as well as study schema, they are mainly used for the following purposes: intermediate / semi processed source table for ETL (lots of the ds_* queries),  helper queries for Learn About (some ds_ and most learn_). 
Through java code. For more complex processing, java based (or a combination of query and java) approach is used. See PopulateTreatmentArmTask for example. 

## Compiling scss for cds
Style for main cds app live in *._scss files and needs to be compiled into css (Connector-all_01.css & Connector-all_02.css) and checked in by developers since the build process doesn’t compile them.

Requirement:
Sencha Cmd (v4.0.2.67 required). https://www.labkey.org/_webdav/home/Developer/%40files/sencha/
JDK 8 available on os (The default java version on system doesn’t have to be 8, but java 8 is needed as Sencha Cmd does not support java version >=9)

Run cmd in terminal to compile scss:
```
> cd app/Connector
> sencha ant sass
```

Java version troubleshoot:
```java
[ERR] javax/xml/bind/DatatypeConverter -
```
Solution: Make sure your terminal’s java version is 8, open a new terminal, run:
```
> export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)
```
Staging and prod server upgrade
Staging server reminder: One thing worth reminding Jon of during each staging upgrade is, for DataSpace staging, a data refresh is never needed/desired. The staging server may hold in progress work, such as R reports, that should not be wiped out during upgrade.  
CDS take the latest patch release build, not the latest Alpha (sprint) build. 
For each upgrade, developer should check if there is any dataset change. If so, upload the version of MasterDataspace/ folder that matches the build to the server, and run folder import to update dataset definition. If this is not done, ETL might fail. 
If there is new data, the 2 ETLs will be run. Usually the client uploads the new data and then run the ETLs themselves.
Recommend browser cache clearing if client is seeing weird styles.
