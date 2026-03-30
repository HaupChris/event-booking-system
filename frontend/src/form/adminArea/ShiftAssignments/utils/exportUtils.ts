// @ts-ignore
import { download, generateCsv, mkConfig } from 'export-to-csv';
import type { ShiftAssignment } from '../types';

export const exportShiftAssignments = (assignments: ShiftAssignment[]) => {
  // First export - by name (sorted by lastname, lastname first)
  const filename_1 = 'Assignment_by_name.csv';
  const csvConfig1 = mkConfig({ filename: filename_1, useKeysAsHeaders: true });

  const data1 = assignments
    .sort((a, b) => a.last_name.localeCompare(b.last_name))
    .map((assignment) => ({
      LastName: assignment.last_name,
      FirstName: assignment.first_name,
      Phone: assignment.phone,
      Dienst: assignment.workshift_title,
      Schicht: assignment.timeslot_title,
      Start: assignment.timeslot_start,
      Ende: assignment.timeslot_end,
    }));

  const csv1 = generateCsv(csvConfig1)(data1);
  download(csvConfig1)(csv1);

  // Second export - by shift (sorted by Dienst, then Schicht, then Start)
  const filename_2 = 'Assignment_by_shift.csv';
  const csvConfig2 = mkConfig({ filename: filename_2, useKeysAsHeaders: true });

  const data2 = assignments
    .sort((a, b) => {
      if (a.workshift_title !== b.workshift_title) {
        return a.workshift_title.localeCompare(b.workshift_title);
      }
      if (a.timeslot_title !== b.timeslot_title) {
        return a.timeslot_title.localeCompare(b.timeslot_title);
      }
      return a.timeslot_start.localeCompare(b.timeslot_start);
    })
    .map((assignment) => ({
      Dienst: assignment.workshift_title,
      Schicht: assignment.timeslot_title,
      Start: assignment.timeslot_start,
      Ende: assignment.timeslot_end,
      FirstName: assignment.first_name,
      LastName: assignment.last_name,
      Phone: assignment.phone,
    }));

  const csv2 = generateCsv(csvConfig2)(data2);
  download(csvConfig2)(csv2);
};
