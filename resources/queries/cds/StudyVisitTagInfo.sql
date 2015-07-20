SELECT
vtm.container.entityid AS container_id,
sp.Label AS study_label,
sp.TimepointType AS timepoint_type,
vtm.study_group_id.group_name,
vtm.visit_row_id,
v.ProtocolDay AS protocol_day,
v.Label AS visit_label,
v.SequenceNumMin AS sequence_num_min,
v.SequenceNumMax AS sequence_num_max,
vt.name AS visit_tag_name,
vt.caption AS visit_tag_caption,
vt.singleuse AS single_use,
vtm.is_vaccination
FROM visittagmap vtm
LEFT JOIN study.StudyProperties sp ON sp.container = vtm.container
LEFT JOIN study.Visit v ON v.rowid = vtm.visit_row_id
LEFT JOIN study.VisitTag vt ON vtm.visit_tag = vt.name