import { NextResponse } from "next/server";
import { generateDrmCertificate, verifyDrmFingerprint } from "@/lib/security/securityService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, project, fingerprint, creatorName, creatorEmail } = body;

    if (action === "verify") {
      const verification = verifyDrmFingerprint(fingerprint);
      return NextResponse.json(verification);
    }

    if (!project) {
      return NextResponse.json({ error: "Project data required to generate certificate" }, { status: 400 });
    }

    const cert = generateDrmCertificate(project, creatorName, creatorEmail);
    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error("DRM API error:", error);
    return NextResponse.json({ error: "Failed to process DRM request" }, { status: 500 });
  }
}
