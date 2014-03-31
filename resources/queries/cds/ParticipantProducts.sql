SELECT pt.SubjectId, p.*
FROM study.ParticipantTreatments pt
     JOIN study.TreatmentProductMap tpm on pt.TreatmentId=tpm.TreatmentId
     JOIN study.Product p on p.RowId=tpm.ProductId