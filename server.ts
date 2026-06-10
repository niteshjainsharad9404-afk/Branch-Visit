import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import XLSX from "xlsx";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload size limits for complex collections
  app.use(express.json({ limit: "15mb" }));

  const BACKUP_DIR = path.join(process.cwd(), "backups");
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const EXCEL_PATH = path.join(BACKUP_DIR, "branches_backup.xlsx");
  const CSV_PATH = path.join(BACKUP_DIR, "branches_backup.csv");
  const JSON_PATH = path.join(BACKUP_DIR, "branches_backup.json");

  // API Route: Save backup to backend
  app.post("/api/backup", (req, res) => {
    try {
      const { branches } = req.body;
      if (!Array.isArray(branches)) {
        return res.status(400).json({ error: "Invalid branches data structure. Expected array." });
      }

      // Write JSON file for quick restoration
      fs.writeFileSync(JSON_PATH, JSON.stringify(branches, null, 2), "utf-8");

      if (branches.length === 0) {
        // If list is empty, make sure to delete or clear backup files safely
        if (fs.existsSync(EXCEL_PATH)) fs.unlinkSync(EXCEL_PATH);
        if (fs.existsSync(CSV_PATH)) fs.unlinkSync(CSV_PATH);
        return res.json({
          success: true,
          message: "Local database was cleared. Server backups flushed out cleanly.",
          recordCount: 0,
          lastUpdated: new Date().toISOString()
        });
      }

      // Map details to high-fidelity, polished columns for Excel spreadsheet inspection
      const excelRows = branches.map((b: any) => ({
        "Record ID": b.id,
        "Registered Timestamp (UTC)": b.timestamp,
        "Associated Bank": b.bankName,
        "Branch Location Core": b.branchName,
        "Branch Code Identifier": b.branchCode,
        "IFSC Code Codebase": b.branchIfscCode,
        "Branch Manager Name": b.branchManagerName,
        "Manager Mobile Coordinator": b.branchManagerMobileNo,
        "Manager Email Address": b.branchManagerEmail,
        "On-Site GPS / Physical Landmark Coordinates": b.branchRecommendLocation || "Not specified",
        "RO Circle Coordination": b.bankRoCircleName,
        "FI Node Officer Name": b.bankRoCircleFiName,
        "FI Officer contact": b.bankRoCircleFiContactNo
      }));

      // Generate worksheet & workbook
      const worksheet = XLSX.utils.json_to_sheet(excelRows);

      // Auto-fit Excel sheet column widths for high legibility
      const max_widths = Object.keys(excelRows[0] || {}).map(key => {
        let max_len = key.length;
        excelRows.forEach((row: any) => {
          const val = String(row[key] || "");
          if (val.length > max_len) max_len = val.length;
        });
        return { wch: Math.min(Math.max(max_len + 2, 10), 65) };
      });
      worksheet["!cols"] = max_widths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Collected Bank Branches");

      // Write binary Excel workbook file
      XLSX.writeFile(workbook, EXCEL_PATH);

      // Generate CSV raw backup
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      fs.writeFileSync(CSV_PATH, csvContent, "utf-8");

      const excelBytes = fs.statSync(EXCEL_PATH).size;

      console.log(`[Excel System] Dynamic Excel spreadsheet compiled: ${branches.length} records, Size: ${excelBytes} bytes.`);

      res.json({
        success: true,
        message: `Excel spreadsheet backup successfully synchronised in backend workspace with ${branches.length} branches!`,
        excelDownloadUrl: "/api/download/excel",
        csvDownloadUrl: "/api/download/csv",
        recordCount: branches.length,
        excelSize: excelBytes,
        lastUpdated: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("[Excel Compiler Exception]", err);
      res.status(500).json({ error: "Failed to automatically assemble backup sheet files in backend.", detail: err.message });
    }
  });

  // API Route: Download Excel sheets directly
  app.get("/api/download/excel", (req, res) => {
    if (fs.existsSync(EXCEL_PATH)) {
      res.setHeader("Content-Disposition", "attachment; filename=bank_branches_audit_backup.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      fs.createReadStream(EXCEL_PATH).pipe(res);
    } else {
      res.status(404).json({ error: "Local Excel spreadsheet backups don't exist yet on backend. Register some branch details." });
    }
  });

  // API Route: Download CSV files
  app.get("/api/download/csv", (req, res) => {
    if (fs.existsSync(CSV_PATH)) {
      res.setHeader("Content-Disposition", "attachment; filename=bank_branches_audit_backup.csv");
      res.setHeader("Content-Type", "text/csv");
      fs.createReadStream(CSV_PATH).pipe(res);
    } else {
      res.status(404).json({ error: "Local CSV backup files don't exist yet. Configure some records." });
    }
  });

  // API Route: Pull backend backup state to load on client boot
  app.get("/api/load-backup", (req, res) => {
    if (fs.existsSync(JSON_PATH)) {
      try {
        const rawJson = fs.readFileSync(JSON_PATH, "utf-8");
        const parsedBranches = JSON.parse(rawJson);
        const fileStats = fs.statSync(EXCEL_PATH);
        res.json({
          available: true,
          branches: parsedBranches,
          lastUpdated: fileStats.mtime,
          recordCount: parsedBranches.length
        });
      } catch (err: any) {
        res.status(500).json({ error: "Failed to restore server backup.", detail: err.message });
      }
    } else {
      res.json({ available: false, branches: [] });
    }
  });

  // API Route: View backup statistics in dashboard
  app.get("/api/backup-info", (req, res) => {
    const stats = {
      excelAvailable: fs.existsSync(EXCEL_PATH),
      csvAvailable: fs.existsSync(CSV_PATH),
      excelSize: fs.existsSync(EXCEL_PATH) ? fs.statSync(EXCEL_PATH).size : 0,
      csvSize: fs.existsSync(CSV_PATH) ? fs.statSync(CSV_PATH).size : 0,
      lastUpdated: fs.existsSync(EXCEL_PATH) ? fs.statSync(EXCEL_PATH).mtime : null,
      recordCount: 0
    };

    if (fs.existsSync(JSON_PATH)) {
      try {
        const rawJson = fs.readFileSync(JSON_PATH, "utf-8");
        stats.recordCount = JSON.parse(rawJson).length;
      } catch (e) {}
    }

    res.json(stats);
  });

  // Express + Vite Integration Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Core Server listening on port ${PORT}`);
  });
}

startServer();
