"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  GraduationCap, 
  Mail, 
  Phone, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  Sparkles,
  Plus
} from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { INITIAL_STUDENTS, Student } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");

  // Add/Import Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"SINGLE" | "CSV">("SINGLE");

  // Single Student Form
  const [newRegNo, setNewRegNo] = useState(`THF-26-000${students.length + 1}`);
  const [newFullName, setNewFullName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("Grade 11 (O/L)");
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");

  // CSV Import state
  const [csvText, setCsvText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredStudents = students.filter((std) => {
    const matchesGrade = gradeFilter === "ALL" || std.gradeLevel === gradeFilter;
    const matchesSearch =
      std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.studentRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.guardianEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.guardianName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newRegNo || !newFullName || !newGuardianEmail) {
      setFormError("Please fill in Registration No, Full Name, and Guardian Email.");
      return;
    }

    // Check duplicate reg no
    if (students.some((s) => s.studentRegNo.toUpperCase() === newRegNo.toUpperCase())) {
      setFormError(`Student Reg No "${newRegNo}" already exists in roster!`);
      return;
    }

    const newStudent: Student = {
      id: `std-00${students.length + 1}`,
      studentRegNo: newRegNo.toUpperCase(),
      fullName: newFullName,
      gradeLevel: newGradeLevel,
      guardianName: newGuardianName,
      guardianEmail: newGuardianEmail,
      guardianPhone: newGuardianPhone || "+94 77 000 0000",
      whatsappNumber: newWhatsapp || newGuardianPhone || "+94 77 000 0000",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setStudents([newStudent, ...students]);
    setSuccessMessage(`Added student ${newStudent.fullName} (${newStudent.studentRegNo}) to roster!`);
    setIsAddModalOpen(false);

    // Reset form
    setNewFullName("");
    setNewGuardianName("");
    setNewGuardianEmail("");
    setNewGuardianPhone("");
    setNewRegNo(`THF-26-000${students.length + 2}`);
  };

  const handleImportCsv = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!csvText.trim()) {
      setFormError("Please paste CSV content with student details.");
      return;
    }

    try {
      const lines = csvText.trim().split("\n");
      const importedList: Student[] = [];

      lines.forEach((line, index) => {
        // Skip header line if present
        if (index === 0 && line.toLowerCase().includes("reg")) return;

        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 3) {
          const [regNo, name, grade, parentName, email, phone] = parts;
          importedList.push({
            id: `std-csv-${index}-${Date.now()}`,
            studentRegNo: regNo || `THF-26-000${students.length + index + 1}`,
            fullName: name || "Student " + (index + 1),
            gradeLevel: grade || "Grade 11 (O/L)",
            guardianName: parentName || "Parent",
            guardianEmail: email || "parent@example.com",
            guardianPhone: phone || "+94 77 123 4567",
            whatsappNumber: phone || "+94 77 123 4567",
            createdAt: new Date().toISOString().split("T")[0],
          });
        }
      });

      if (importedList.length === 0) {
        setFormError("Could not parse valid student rows from CSV.");
        return;
      }

      setStudents([...importedList, ...students]);
      setSuccessMessage(`Successfully bulk imported ${importedList.length} student(s) into roster!`);
      setIsAddModalOpen(false);
      setCsvText("");
    } catch {
      setFormError("Error parsing CSV format. Ensure comma-separated values.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Roster & Administration"
        subtitle="Manage enrolled THOFNAA students, assign registration numbers, and bulk import class rosters."
        badgeText="Roster Management"
        action={
          <Button
            variant="secondary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold shadow-gold"
          >
            Add / Bulk Import Students
          </Button>
        }
      />

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-thofnaa-emerald shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-thofnaa-emerald font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Roster Search & Filter Card */}
      <Card goldHeaderBorder className="shadow-md">
        <CardHeader className="bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Registered Student Roster</CardTitle>
              <CardDescription>
                Showing {filteredStudents.length} of {students.length} active students.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search name, reg no, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full sm:w-64"
              />
              <Select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                options={["ALL", ...THOFNAA_CONFIG.grades]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-thofnaa-navy-50 text-thofnaa-navy uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                  <th className="py-3.5 px-4">Reg Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Grade Level</th>
                  <th className="py-3.5 px-4">Guardian Details</th>
                  <th className="py-3.5 px-4">WhatsApp / Contact</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-extrabold text-thofnaa-navy">
                      {std.studentRegNo}
                    </td>
                    <td className="py-4 px-4 font-serif font-bold text-thofnaa-charcoal text-sm">
                      {std.fullName}
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <span className="px-2.5 py-0.5 rounded-full bg-thofnaa-navy-50 text-thofnaa-navy border border-thofnaa-navy/20 text-[11px]">
                        {std.gradeLevel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-thofnaa-charcoal">{std.guardianName}</p>
                      <span className="text-[10px] font-mono text-gray-500">{std.guardianEmail}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-600">
                      {std.whatsappNumber}
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-mono">
                      {std.createdAt}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/admin/students/${std.id}`}>
                        <Button variant="outline" size="sm" className="px-3 py-1 text-[11px]">
                          View Profile & Payments
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Import Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-thofnaa-navy/60 backdrop-blur-xs animate-in fade-in">
          <Card goldHeaderBorder className="w-full max-w-xl bg-white shadow-2xl space-y-4">
            <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-thofnaa-gold" />
                <CardTitle className="text-white text-base">Add or Import Students</CardTitle>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-thofnaa-gold hover:text-white text-sm font-bold"
              >
                ✕ Close
              </button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tab selector between Single vs CSV */}
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setAddMode("SINGLE")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    addMode === "SINGLE" ? "bg-white text-thofnaa-navy shadow-xs" : "text-gray-600"
                  }`}
                >
                  Add Single Student
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("CSV")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    addMode === "CSV" ? "bg-white text-thofnaa-navy shadow-xs" : "text-gray-600"
                  }`}
                >
                  Bulk CSV Import
                </button>
              </div>

              <FormError message={formError} />

              {addMode === "SINGLE" ? (
                <form onSubmit={handleAddSingleStudent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Student Reg Number"
                      value={newRegNo}
                      onChange={(e) => setNewRegNo(e.target.value.toUpperCase())}
                      placeholder="THF-26-0004"
                      required
                    />

                    <Select
                      label="Grade Level"
                      value={newGradeLevel}
                      onChange={(e) => setNewGradeLevel(e.target.value)}
                      options={THOFNAA_CONFIG.grades}
                      required
                    />
                  </div>

                  <Input
                    label="Full Student Name"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Ruwan Wickremasinghe"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Guardian Name"
                      value={newGuardianName}
                      onChange={(e) => setNewGuardianName(e.target.value)}
                      placeholder="Parent Name"
                      required
                    />

                    <Input
                      label="Guardian Email (For Receipts)"
                      type="email"
                      value={newGuardianEmail}
                      onChange={(e) => setNewGuardianEmail(e.target.value)}
                      placeholder="parent@gmail.com"
                      required
                    />
                  </div>

                  <Input
                    label="WhatsApp / Mobile Number"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    required
                  />

                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="success" size="md" className="font-bold">
                      Save Student to Roster
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleImportCsv} className="space-y-4">
                  <div className="p-3 rounded-lg bg-thofnaa-navy-50 border border-thofnaa-navy-100 text-xs space-y-1 text-thofnaa-navy">
                    <p className="font-bold">CSV Format Template:</p>
                    <p className="font-mono text-[11px]">
                      regNo, fullName, gradeLevel, guardianName, guardianEmail, phone
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-thofnaa-charcoal">
                      Paste CSV Content Below
                    </label>
                    <textarea
                      rows={6}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder={`THF-26-0004, Nuwan Pradeep, Grade 11 (O/L), Sarath Pradeep, sarath@gmail.com, +94 77 444 5555\nTHF-26-0005, Anuki Fernando, Grade 10, Nimali Fernando, nimali@yahoo.com, +94 71 888 9999`}
                      className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs focus:border-thofnaa-navy focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="md" className="font-bold">
                      Import CSV Roster
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
