import React, { useState } from 'react';
import {
  FormDefinition,
  FormSubmissionRecord,
} from '../../types/form-schema';
import {
  generateSqlServerDDL,
  generateSqlServerInserts,
  SQL_ERD_SCHEMA,
} from '../../utils/sql-generator';
import {
  Database,
  Table,
  Code2,
  Copy,
  Download,
  Check,
  Search,
  ExternalLink,
  Layers,
  Terminal,
  Play,
} from 'lucide-react';

interface SqlServerInspectorProps {
  formDefinition: FormDefinition;
  submissions: FormSubmissionRecord[];
}

type SqlSubView = 'tables' | 'erd' | 'tsql' | 'api-json' | 'query';

export const SqlServerInspector: React.FC<SqlServerInspectorProps> = ({
  formDefinition,
  submissions,
}) => {
  const [subView, setSubView] = useState<SqlSubView>('tables');
  const [activeTable, setActiveTable] = useState<string>('Forms');
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // SQL Query runner state
  const [selectedPresetQuery, setSelectedPresetQuery] = useState('JOIN_ALL');
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);

  const fullTsqlScript = `${generateSqlServerDDL()}\n\n${generateSqlServerInserts(
    formDefinition
  )}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([fullTsqlScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formDefinition.form.FormCode}_SqlServerSchema.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Run simulated query
  const executeQuery = (preset: string) => {
    setSelectedPresetQuery(preset);
    if (preset === 'JOIN_ALL') {
      // Join Forms + Sections + Fields
      const rows = formDefinition.fields.map((fld) => {
        const sec = formDefinition.sections.find((s) => s.SectionID === fld.SectionID);
        const deps = formDefinition.dependencies.filter(
          (d) => d.TargetFieldID === fld.FieldID
        ).length;
        const vals = formDefinition.validations.filter(
          (v) => v.FieldID === fld.FieldID
        ).length;
        return {
          FormCode: formDefinition.form.FormCode,
          SectionTitle: sec?.SectionTitle || 'N/A',
          FieldName: fld.FieldName,
          FieldLabel: fld.FieldLabel,
          FieldType: fld.FieldType,
          ColumnSpan: `${fld.ColumnSpan}/12`,
          IsRequired: fld.IsRequired ? 'YES' : 'NO',
          RuleCount: deps + vals,
        };
      });
      setQueryOutput(rows);
    } else if (preset === 'DEPENDENCIES') {
      const rows = formDefinition.dependencies.map((dep) => {
        const src = formDefinition.fields.find((f) => f.FieldID === dep.SourceFieldID);
        const tgt = formDefinition.fields.find((f) => f.FieldID === dep.TargetFieldID);
        return {
          DependencyID: dep.DependencyID,
          SourceField: src?.FieldName || dep.SourceFieldID,
          Condition: `${dep.ConditionOperator} '${dep.ConditionValue}'`,
          Action: dep.ActionType,
          TargetField: tgt?.FieldName || dep.TargetFieldID,
        };
      });
      setQueryOutput(rows);
    } else if (preset === 'SUBMISSIONS_EAV') {
      const rows = submissions.map((s) => ({
        SubmissionID: s.SubmissionID,
        ReferenceNo: s.ReferenceNo,
        SubmittedBy: s.SubmittedBy,
        SubmittedAt: new Date(s.SubmittedAt).toLocaleString(),
        Status: s.Status,
        ValuesStored: Object.keys(s.PayloadJson || {}).length,
      }));
      setQueryOutput(rows);
    }
  };

  // Table row data computation
  const getTableRows = (table: string): any[] => {
    switch (table) {
      case 'Forms':
        return [formDefinition.form];
      case 'FormSections':
        return formDefinition.sections;
      case 'FormFields':
        return formDefinition.fields;
      case 'FieldOptions':
        return formDefinition.options;
      case 'FieldDependencies':
        return formDefinition.dependencies;
      case 'FormValidations':
        return formDefinition.validations;
      case 'FormSubmissions':
        return submissions;
      default:
        return [];
    }
  };

  const currentRows = getTableRows(activeTable);
  const filteredRows = currentRows.filter((row) => {
    if (!searchFilter.trim()) return true;
    return JSON.stringify(row).toLowerCase().includes(searchFilter.toLowerCase());
  });

  const columns = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                SQL SERVER DATABASE STORE
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">T-SQL 2022</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              Relational Tables, DDL & API JSON Pipeline
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCopy(fullTsqlScript)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied T-SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSubView('tables')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            subView === 'tables'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Relational Tables Data</span>
        </button>

        <button
          onClick={() => setSubView('erd')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            subView === 'erd'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Database Schema ERD</span>
        </button>

        <button
          onClick={() => setSubView('tsql')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            subView === 'tsql'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>T-SQL DDL Script</span>
        </button>

        <button
          onClick={() => setSubView('api-json')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            subView === 'api-json'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>API / JSON Contract</span>
        </button>

        <button
          onClick={() => {
            setSubView('query');
            if (!queryOutput) executeQuery('JOIN_ALL');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            subView === 'query'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SQL Query Runner</span>
        </button>
      </div>

      {/* VIEW 1: Relational Tables Browser */}
      {subView === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Table List Sidebar (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              SQL Server Tables ({SQL_ERD_SCHEMA.length})
            </h3>

            {SQL_ERD_SCHEMA.map((tbl) => {
              const rows = getTableRows(tbl.name);
              const isActive = activeTable === tbl.name;

              return (
                <button
                  key={tbl.name}
                  onClick={() => {
                    setActiveTable(tbl.name);
                    setSearchFilter('');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Table
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    />
                    <span className="font-mono font-medium">{tbl.name}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rows.length} rows
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table Data View (9 cols) */}
          <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-900">
                    dbo.{activeTable}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">
                    {filteredRows.length} records matching
                  </span>
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter table rows..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto max-h-[600px]">
              {filteredRows.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No records found in table [dbo].[{activeTable}].
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-mono text-[11px]">
                      {columns.map((col) => (
                        <th key={col} className="p-2.5 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 font-mono text-[11px]">
                        {columns.map((col) => {
                          const val = row[col];
                          const str =
                            val === null || val === undefined
                              ? 'NULL'
                              : typeof val === 'object'
                              ? JSON.stringify(val)
                              : String(val);

                          return (
                            <td
                              key={col}
                              className="p-2.5 max-w-xs truncate text-slate-800"
                              title={str}
                            >
                              {val === null || val === undefined ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : typeof val === 'boolean' ? (
                                <span
                                  className={`px-1.5 py-0.2 rounded font-semibold ${
                                    val
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {val ? 'TRUE' : 'FALSE'}
                                </span>
                              ) : (
                                str
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ERD Diagram Visualizer */}
      {subView === 'erd' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Entity Relationship Diagram (3NF Normalized)
            </h3>
            <p className="text-xs text-slate-500">
              Relational dependencies modeled in Microsoft SQL Server for the Form Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SQL_ERD_SCHEMA.map((tbl) => (
              <div
                key={tbl.name}
                className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-xs"
              >
                {/* Table Header */}
                <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-3.5 h-3.5 text-amber-300" />
                    <span className="font-mono font-bold text-xs">
                      dbo.{tbl.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {tbl.columns.length} cols
                  </span>
                </div>

                {/* Table Columns */}
                <div className="p-3 divide-y divide-slate-200/60 font-mono text-[11px]">
                  {tbl.columns.map((c) => (
                    <div
                      key={c.name}
                      className="py-1.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {c.isPk && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded">
                            PK
                          </span>
                        )}
                        {c.isFk && (
                          <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1 rounded">
                            FK
                          </span>
                        )}
                        <span className="font-medium text-slate-900 truncate">
                          {c.name}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] shrink-0 text-right">
                        <span>{c.type}</span>
                        {c.fkRef && (
                          <span className="block text-[9px] text-indigo-600 font-medium">
                            → {c.fkRef}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: T-SQL DDL Script */}
      {subView === 'tsql' && (
        <div className="bg-slate-950 text-slate-200 rounded-xl p-5 shadow-sm overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs text-amber-400 font-bold">
              schema_and_inserts.sql
            </span>
            <button
              onClick={() => handleCopy(fullTsqlScript)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white rounded transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto max-h-[600px] leading-relaxed text-slate-300">
            {fullTsqlScript}
          </pre>
        </div>
      )}

      {/* VIEW 4: API JSON Contract */}
      {subView === 'api-json' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                REST API Composite Endpoint
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                GET /api/v1/forms/{formDefinition.form.FormCode}/definition
              </p>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(formDefinition, null, 2))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed">
            {JSON.stringify(formDefinition, null, 2)}
          </pre>
        </div>
      )}

      {/* VIEW 5: SQL Query Runner */}
      {subView === 'query' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive T-SQL Query Playground
            </h3>
            <p className="text-xs text-slate-500">
              Execute relational join queries across Forms, Sections, Fields, and Dependencies.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => executeQuery('JOIN_ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedPresetQuery === 'JOIN_ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Query Form Hierarchy (JOIN Forms + Sections + Fields)</span>
            </button>

            <button
              onClick={() => executeQuery('DEPENDENCIES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedPresetQuery === 'DEPENDENCIES'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Query Conditional Logic Map</span>
            </button>

            <button
              onClick={() => executeQuery('SUBMISSIONS_EAV')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedPresetQuery === 'SUBMISSIONS_EAV'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Query Submissions Stored</span>
            </button>
          </div>

          {/* Query Results Table */}
          {queryOutput && queryOutput.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <div className="bg-slate-100 px-4 py-2 text-xs font-mono font-semibold text-slate-700 border-b border-slate-200 flex justify-between">
                <span>Result Set: {queryOutput.length} rows returned</span>
                <span className="text-emerald-700">Execution: 0ms (In-Memory Engine)</span>
              </div>
              <div className="overflow-x-auto max-h-[450px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono text-[11px]">
                      {Object.keys(queryOutput[0]).map((col) => (
                        <th key={col} className="p-2.5 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queryOutput.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-mono text-[11px]">
                        {Object.keys(row).map((col) => (
                          <td key={col} className="p-2.5 text-slate-800">
                            {String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
