import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    const trademarks = await prisma.trademark.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(trademarks);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Error fetching trademarks" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const clientName = formData.get("clientName") || "";
    const trademarkName = formData.get("trademarkName") || "";
    const owner = formData.get("owner") || "";
    const status = formData.get("status") || "Solicitada";
    const fileNumber = formData.get("fileNumber") || "";
    const registrationNumber = formData.get("registrationNumber") || "";
    
    const parseDate = (val) => {
      if (!val || val.trim() === "") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    const applicationDate = parseDate(formData.get("applicationDate"));
    const registrationDate = parseDate(formData.get("registrationDate"));
    const expirationDate = parseDate(formData.get("expirationDate"));
    
    const niceClasses = formData.get("niceClasses") || "";
    const notes = formData.get("notes") || "";
    
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
       await mkdir(uploadDir, { recursive: true });
    }

    const saveFile = async (file) => {
      if (!file || !file.name || file.size === 0) return null;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      await writeFile(join(uploadDir, filename), buffer);
      return `/uploads/${filename}`;
    };

    const logoFile = formData.get("logo");
    const logoUrl = await saveFile(logoFile);

    const documentsData = [];
    const docCount = parseInt(formData.get("doc_count") || "0");
    for (let i = 0; i < docCount; i++) {
      const docFile = formData.get(`doc_file_${i}`);
      const docDateVal = formData.get(`doc_date_${i}`);
      const docDesc = formData.get(`doc_desc_${i}`) || "";
      
      const fileUrl = await saveFile(docFile);
      if (fileUrl) {
         documentsData.push({
           date: parseDate(docDateVal),
           description: docDesc,
           fileUrl: fileUrl
         });
      }
    }

    const trademark = await prisma.trademark.create({
      data: {
        clientName,
        trademarkName,
        owner,
        status,
        fileNumber,
        registrationNumber,
        applicationDate,
        registrationDate,
        expirationDate,
        niceClasses,
        notes,
        logoUrl,
        documents: documentsData.length > 0 ? {
          create: documentsData
        } : undefined
      }
    });

    return NextResponse.json(trademark, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message || "Error creating trademark" }, { status: 500 });
  }
}
