# Change Management Page Migration Guide

این صفحه به دلیل حجم بالا (1831 خط) و تعداد زیاد fetch calls، نیاز به migration گسترده دارد.

## تغییرات لازم:

### 1. اضافه کردن import
```typescript
import * as ChangeManagementAPI from '@/lib/api/change-management';
```

### 2. حذف interfaceهای تکراری که در API Service موجود هستند

این interfaceها را حذف کنید چون در `/lib/api/change-management.ts` تعریف شده‌اند:
- `ChangeSet` → از `ChangeManagementAPI.ChangeSetDto` استفاده کنید
- `ChangeSetDetails` → از `ChangeManagementAPI.ChangeSetDetailDto` استفاده کنید
- `ImpactAnalysis` → از `ChangeManagementAPI.ImpactAnalysis` استفاده کنید
- `Template` → از `ChangeManagementAPI.ChangeSetTemplate` استفاده کنید
- `ApprovalRule` → از `ChangeManagementAPI.ApprovalRule` استفاده کنید
- `PendingApproval` → از `ChangeManagementAPI.PendingApproval` استفاده کنید

### 3. Migration Fetch Calls

#### fetchChangeSets (خط 214-265)
```typescript
// قبل از migration:
const response = await fetch(`http://localhost:7000/api/tenant/change-management/change-sets?...`);

// بعد از migration:
const data = await ChangeManagementAPI.getChangeSets(tenantId, {
  status: statusFilter !== 'All' ? statusFilter : undefined,
  page,
  pageSize,
});
setChangeSets(data.items);
setTotalItems(data.totalCount);
```

#### fetchPendingApprovals (خط 267-290)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getPendingApprovals(tenantId, userId, { page, pageSize });
setPendingApprovals(data.items);
setTotalItems(data.totalCount);
```

#### fetchApprovalRules (خط 292-322)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getApprovalRules(tenantId);
setApprovalRules(data);
```

#### fetchChangeSetDetails (خط 325-361)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getChangeSet(id, tenantId);
setChangeSetDetails(data);
```

#### handleSimulate (خط 364-397)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.simulateChangeSet(id, tenantId, userId);
setSimulationResult(data);
setSuccess('Simulation completed successfully');
```

#### fetchExecutionLogs (خط 400-434)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getExecutionLog(id, tenantId);
setExecutionLogs(data);
```

#### handleSchedule (خط 437-464)
```typescript
// بعد از migration:
await ChangeManagementAPI.scheduleChangeSet(selectedChangeSet.id, {
  tenantId,
  userId,
  scheduledFor: scheduleData.scheduledAt,
});
setSuccess('Change set scheduled successfully');
```

#### handleExecute (خط 467-489)
```typescript
// بعد از migration:
await ChangeManagementAPI.applyChangeSet(selectedChangeSet.id, tenantId, userId);
setSuccess('Change set executed successfully');
```

#### handleRollback (خط 492-514)
```typescript
// بعد از migration:
await ChangeManagementAPI.rollbackChangeSet(selectedChangeSet.id, {
  tenantId,
  userId,
  reason: 'Manual rollback',
});
setSuccess('Change set rolled back successfully');
```

#### handleApproveChangeSet (خط 517-540)
```typescript
// بعد از migration:
await ChangeManagementAPI.approveChangeSet(selectedChangeSet.id, {
  tenantId,
  userId,
  reason: approvalComment,
});
setSuccess('Change set approved');
```

#### handleRejectChangeSet (خط 543-569)
```typescript
// بعد از migration:
await ChangeManagementAPI.rejectChangeSet(selectedChangeSet.id, {
  tenantId,
  userId,
  reason: rejectReason,
});
setSuccess('Change set rejected');
```

#### fetchApprovals (خط 572-602)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getApprovals(id, tenantId);
setApprovals(data);
```

#### fetchImpactAnalysis (خط 605-630)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getImpactAnalysis(id, tenantId);
setImpactAnalysis(data);
```

#### handleClone (خط 633-659)
```typescript
// بعد از migration:
await ChangeManagementAPI.cloneChangeSet(selectedChangeSet.id, {
  tenantId,
  userId,
  name: cloneName,
});
setSuccess('Change set cloned successfully');
```

#### fetchTemplates (خط 662-704)
```typescript
// بعد از migration:
const data = await ChangeManagementAPI.getChangeSetTemplates(tenantId);
setTemplates(data);
```

#### handleCreateChangeSet (خط 717-748)
```typescript
// بعد از migration:
await ChangeManagementAPI.createChangeSet({
  tenantId,
  userId,
  title: newChangeSet.name,
  description: newChangeSet.description,
  category: newChangeSet.targetModule,
  items: [], // Parse from changesJson
});
setSuccess('Change set created successfully');
```

#### handleSubmitForReview (خط 751-767)
```typescript
// بعد از migration:
await ChangeManagementAPI.submitChangeSet(changeSet.id, tenantId, userId);
setSuccess('Change set submitted for review');
```

#### handleDeleteChangeSet (خط 829-845)
```typescript
// بعد از migration:
await ChangeManagementAPI.deleteChangeSet(id, tenantId);
setSuccess('Change set deleted');
```

#### handleCreateRule (خط 847-877)
```typescript
// بعد از migration:
await ChangeManagementAPI.createApprovalRule({
  tenantId,
  ...newRule,
});
setSuccess('Approval rule created successfully');
```

#### handleToggleRule (خط 879-895)
```typescript
// بعد از migration:
await ChangeManagementAPI.toggleApprovalRule(rule.id, {
  tenantId,
  isActive: !rule.isActive,
});
setSuccess(`Rule ${rule.isActive ? 'disabled' : 'enabled'}`);
```

## نکات مهم:

1. این صفحه از endpoints متفاوتی استفاده می‌کند (`/api/tenant/change-management/...` و `/api/tenant/changesets/...`)
2. برخی از DTOها در service با نام متفاوت هستند (مثلاً `title` در service اما `name` در صفحه)
3. نیاز به تبدیل data structure در برخی موارد وجود دارد
4. توصیه می‌شود این migration به صورت تدریجی و با تست دقیق انجام شود

## وضعیت Migration:

- ✅ Services آماده شده‌اند
- ⏳ Migration صفحه نیاز به تست کامل دارد
- ⚠️ برخی endpoint URLها در صفحه با service match ندارند و نیاز به هماهنگی با backend دارند
