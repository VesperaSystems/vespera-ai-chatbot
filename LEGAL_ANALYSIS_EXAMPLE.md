# Legal Analysis Response Example

## Sample Document Content

```
EMPLOYMENT AGREEMENT

This Employment Agreement (the "Agreement") is entered into between ABC Company (the "Company") and John Doe (the "Employee") on January 1, 2024.

1. Position and Duties
The Employee shall serve as a Software Engineer and perform such duties as may be assigned by the Company.

2. Compensation
The Employee shall receive a salary of $X per year, payable in accordance with the Company's standard payroll practices.

3. Term
This Agreement shall commence on January 1, 2024 and continue until terminated by either party.

4. Termination
Either party may terminate this Agreement at any time with or without cause.

5. Confidentiality
The Employee agrees to keep confidential all information learned during employment.

6. Non-Compete
The Employee shall not work for any competitor for a period of 12 months after termination.
```

## AI Response (JSON Format)

```json
{
  "document": "Employment Agreement",
  "issues": [
    {
      "id": "issue-1",
      "type": "ambiguous_compensation",
      "original_text": "The Employee shall receive a salary of $X per year, payable in accordance with the Company's standard payroll practices.",
      "recommended_text": "The Employee shall receive a salary of $85,000 per year, payable bi-weekly in accordance with the Company's standard payroll practices.",
      "comment": "The original text uses a placeholder '$X' which is ambiguous and unenforceable. Specific compensation amounts should be clearly stated to avoid disputes."
    },
    {
      "id": "issue-2",
      "type": "missing_termination_notice",
      "original_text": "Either party may terminate this Agreement at any time with or without cause.",
      "recommended_text": "Either party may terminate this Agreement with 30 days written notice, or immediately for cause as defined in Section 7.",
      "comment": "The original clause lacks specific notice requirements and definition of 'cause,' which could lead to legal disputes and potential wrongful termination claims."
    },
    {
      "id": "issue-3",
      "type": "overly_broad_non_compete",
      "original_text": "The Employee shall not work for any competitor for a period of 12 months after termination.",
      "recommended_text": "The Employee shall not work for any direct competitor in the same geographic region (within 50 miles of the Company's office) for a period of 6 months after termination, provided the Employee received severance pay.",
      "comment": "The original non-compete clause is overly broad and may be unenforceable in many jurisdictions. It should be limited in scope, duration, and geographic area, and typically requires consideration (severance) to be enforceable."
    },
    {
      "id": "issue-4",
      "type": "missing_benefits_clause",
      "original_text": "",
      "recommended_text": "The Employee shall be eligible for health insurance, retirement benefits, and paid time off in accordance with the Company's standard benefit policies, which may be modified from time to time.",
      "comment": "The agreement lacks any mention of employee benefits, which is a significant omission that could lead to misunderstandings and potential legal issues."
    },
    {
      "id": "issue-5",
      "type": "vague_confidentiality",
      "original_text": "The Employee agrees to keep confidential all information learned during employment.",
      "recommended_text": "The Employee agrees to keep confidential all proprietary, technical, and business information of the Company, including but not limited to trade secrets, customer lists, and financial data, both during employment and for a period of 3 years following termination.",
      "comment": "The original confidentiality clause is too vague and lacks specific definitions and duration. It should clearly define what constitutes confidential information and specify the duration of the obligation."
    }
  ]
}
```

## Formatted Display Output

```markdown
# Legal Analysis: Employment Agreement

**Analysis Summary:**

- Document: Employment Agreement
- Issues Found: 5
- Analysis Type: legal
- Analyzed: 1,247 characters

## 🔍 Issues Found

### Issue 1: ambiguous_compensation

**ID:** issue-1

**Original Text:**
```

The Employee shall receive a salary of $X per year, payable in accordance with the Company's standard payroll practices.

```

**Recommended Text:**
```

The Employee shall receive a salary of $85,000 per year, payable bi-weekly in accordance with the Company's standard payroll practices.

```

**Comment:**
The original text uses a placeholder '$X' which is ambiguous and unenforceable. Specific compensation amounts should be clearly stated to avoid disputes.

---

### Issue 2: missing_termination_notice

**ID:** issue-2

**Original Text:**
```

Either party may terminate this Agreement at any time with or without cause.

```

**Recommended Text:**
```

Either party may terminate this Agreement with 30 days written notice, or immediately for cause as defined in Section 7.

```

**Comment:**
The original clause lacks specific notice requirements and definition of 'cause,' which could lead to legal disputes and potential wrongful termination claims.

---

### Issue 3: overly_broad_non_compete

**ID:** issue-3

**Original Text:**
```

The Employee shall not work for any competitor for a period of 12 months after termination.

```

**Recommended Text:**
```

The Employee shall not work for any direct competitor in the same geographic region (within 50 miles of the Company's office) for a period of 6 months after termination, provided the Employee received severance pay.

```

**Comment:**
The original non-compete clause is overly broad and may be unenforceable in many jurisdictions. It should be limited in scope, duration, and geographic area, and typically requires consideration (severance) to be enforceable.

---

### Issue 4: missing_benefits_clause

**ID:** issue-4

**Original Text:**
```

[No text found]

```

**Recommended Text:**
```

The Employee shall be eligible for health insurance, retirement benefits, and paid time off in accordance with the Company's standard benefit policies, which may be modified from time to time.

```

**Comment:**
The agreement lacks any mention of employee benefits, which is a significant omission that could lead to misunderstandings and potential legal issues.

---

### Issue 5: vague_confidentiality

**ID:** issue-5

**Original Text:**
```

The Employee agrees to keep confidential all information learned during employment.

```

**Recommended Text:**
```

The Employee agrees to keep confidential all proprietary, technical, and business information of the Company, including but not limited to trade secrets, customer lists, and financial data, both during employment and for a period of 3 years following termination.

```

**Comment:**
The original confidentiality clause is too vague and lacks specific definitions and duration. It should clearly define what constitutes confidential information and specify the duration of the obligation.

---
```

## Key Features of the Response

### 1. **Structured JSON Format**

- Validates against strict JSON schema
- Includes document name and array of issues
- Each issue has unique ID, type, and detailed information

### 2. **Issue Types**

- `ambiguous_compensation`: Vague or unclear payment terms
- `missing_termination_notice`: Incomplete termination procedures
- `overly_broad_non_compete`: Unenforceable restrictive covenants
- `missing_benefits_clause`: Omitted employee benefits
- `vague_confidentiality`: Unclear confidentiality obligations

### 3. **Detailed Recommendations**

- **Original Text**: Shows the problematic language
- **Recommended Text**: Provides specific, improved language
- **Comment**: Explains the legal issue and reasoning

### 4. **Legal Focus Areas**

- Contract enforceability
- Regulatory compliance
- Liability protection
- Clear and specific language
- Industry best practices

This structured approach ensures consistent, actionable legal analysis that helps users improve their documents with specific, legally sound recommendations.
