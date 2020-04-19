
-- maps publications to documents
CREATE TABLE cds.import_publicationDocument
(
     Publication_Id VARCHAR(250) NOT NULL,
     Document_Id VARCHAR(250) NOT NULL,
     Container ENTITYID NOT NULL,

     CONSTRAINT PK_ImportPublicationDocument PRIMARY KEY (Publication_Id, Document_Id, Container),
     CONSTRAINT FK_ImportPublicationId_PublicationId FOREIGN KEY (Container, Publication_Id) REFERENCES cds.import_Publication (Container, Publication_Id),
     CONSTRAINT FK_ImportDocumentId_DocumentId FOREIGN KEY (Container, Document_Id) REFERENCES cds.import_Document (Container, Document_Id)
);

CREATE TABLE cds.PublicationDocument
(
    Publication_Id VARCHAR(250) NOT NULL,
    Document_Id VARCHAR(250) NOT NULL,
    Container ENTITYID NOT NULL,

    CONSTRAINT PK_PublicationDocument PRIMARY KEY (Publication_Id, Document_Id, Container),
    CONSTRAINT FK_PublicationId_PublicationId FOREIGN KEY (Container, Publication_Id) REFERENCES cds.Publication (Container, Id),
    CONSTRAINT FK_DocumentId_DocumentId FOREIGN KEY (Container, Document_Id) REFERENCES cds.Document (Container, Document_Id)
);
