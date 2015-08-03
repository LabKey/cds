SELECT
participantid,
folder.parent.entityid as container,
container as study
FROM study.demographics;