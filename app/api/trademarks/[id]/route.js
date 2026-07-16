import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const trademark = await prisma.trademark.findUnique({ 
      where: { id },
      include: { documents: true }
    });
    if (!trademark) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(trademark);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const dataToUpdate = {};
    const fields = ["clientName", "trademarkName", "owner", "status", "fileNumber", "registrationNumber", "niceClasses", "notes"];
    fields.forEach(f => {
      if (formData.has(f)) dataToUpdate[f] = formData.get(f);
    });

    const dateFields = ["applicationDate", "registrationDate", "expirationDate"];
    dateFields.forEach(f => {
      if (formData.has(f)) {
         const val = formData.get(f);
         if (!val || val.trim() === "") {
           dataToUpdate[f] = null;
         } else {
           const d = new Date(val);
           dataToUpdate[f] = isNaN(d.getTime()) ? null : d;
         }
      }
    });

    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const { existsSync } = await import("fs");
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const saveFile = async (file) => {
      if (!file || !file.name || file.size === 0) return null;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      await writeFile(join(uploadDir, filename), buffer);
      return `/uploads/${filename}`;
    };

    const logoFile = formData.get("logo");
    if (logoFile && logoFile.name && logoFile.size > 0) {
      dataToUpdate.logoUrl = await saveFile(logoFile);
    }

    if (formData.has("existing_docs_ids")) {
      const existingIds = JSON.parse(formData.get("existing_docs_ids") || "[]");
      await prisma.document.deleteMany({
        where: {
          trademarkId: id,
          id: { notIn: existingIds }
        }
      });
    }

    const documentsData = [];
    const docCount = parseInt(formData.get("doc_count") || "0");
    for (let i = 0; i < docCount; i++) {
      const docFile = formData.get(`doc_file_${i}`);
      const docDateVal = formData.get(`doc_date_${i}`);
      const docDesc = formData.get(`doc_desc_${i}`) || "";
      
      const fileUrl = await saveFile(docFile);
      if (fileUrl) {
         documentsData.push({
           date: (!docDateVal || docDateVal.trim() === "") ? null : (isNaN(new Date(docDateVal).getTime()) ? null : new Date(docDateVal)),
           description: docDesc,
           fileUrl: fileUrl
         });
      }
    }

    if (documentsData.length > 0) {
      dataToUpdate.documents = {
        create: documentsData
      };
    }

    const updated = await prisma.trademark.update({
      where: { id },
      data: dataToUpdate,
      include: { documents: true }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message || "Error updating" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.trademark.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}
