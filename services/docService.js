import DocumentModel from "../model/docModel.js";
import versionModel from "../model/versionModel.js";

export const updateAndVersionDocument = async (docId, userId, newTitle, newContent, prevTitle, prevContent) => {

    let doc_version = await versionModel.findOne({ document: docId });
    let versionNumber;
    if (doc_version)
        versionNumber = doc_version.versions.length + 1;
    else
        versionNumber = 1;

    const prevVersion = {
        versionNumber,
        editedBy: userId,
        editedAt: new Date(),
        content: {
            title: prevTitle,
            content: prevContent
        }
    };

    if (!doc_version) {
        await versionModel.create({
            document: docId,
            versions: [prevVersion]
        });
    } else {
        doc_version.versions.push(prevVersion);
        await doc_version.save();
    }

    const updatedDoc = await DocumentModel.findByIdAndUpdate(
        docId,
        { title: newTitle, content: newContent },
        { new: true }
    );

    return updatedDoc;
};
