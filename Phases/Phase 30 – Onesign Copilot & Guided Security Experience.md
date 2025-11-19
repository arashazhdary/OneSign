هدف: ساختن یک Copilot عملیاتی برای Tenant Admin / Security Officer که:

با زبان طبیعی سؤال بپرسند و جواب عملیاتی بگیرند

برای تنظیم Security, Policy, Automation قدم به قدم راهنمایی شوند

روی Incident و Hunt و ChangeSet توضیح و پیشنهاد بگیرند

1. Personas و اهداف

Tenant Security Officer / Tenant Admin
می‌خواهد:

بپرسد:

«کیا توی ۲۴ ساعت اخیر بدون MFA وارد شدند»

«اگر این Policy را سخت‌تر کنم چه بلایی سر کاربرها می‌آید»

برای تنظیم MFA, Risk, Automation، و ChangeSet، Wizard راهنما داشته باشد

روی یک Incident بگوید: «جمع بندی کن و بهترین اقدام بعدی را پیشنهاد بده»

Global Security / Platform Owner
می‌خواهد:

از Copilot برای تحلیل cross tenant استفاده کند

Templateهای آماده پرسش و Playbook داشته باشد

2. Scope فاز ۳۰

در Scope

ماژول جدید: Onesign.Modules.Copilot (یا معادل)

سرویس Copilot Backend برای:

پاسخ به پرسش‌های متنی با استفاده از داده‌های داخلی:

Insights

Hunting

Incidents

Automation

ChangeSets

Tenant config

تولید پاسخ ساختاری شده:

خلاصه وضعیت

لیست ریسک‌ها

پیشنهادهای Action قابل کلیک

UI Copilot:

پنل کناری در Admin Portal برای Tenant

پنل مشابه برای Global Admin

Context aware:

اگر روی Incident هستی، Copilot Incident aware باشد

اگر روی Policy یا ChangeSet هستی، Copilot همان را توضیح و شبیه سازی مفهومی بدهد

خارج از Scope

ساخت LLM خودت, Training, MLOps

هرگونه فیچر که بدون داده داخلی فقط شعار می‌دهد

3. Epics و User Story ها
Epic 30.1 – Copilot Sidebar برای Tenant Admin

US 30.1.1
به عنوان Tenant Security Officer
می‌خواهم یک پنل Copilot در Admin Portal داشته باشم تا بتوانم با زبان طبیعی درباره وضعیت هویتی tenant سؤال بپرسم و جواب دقیق و عملی بگیرم.

Acceptance:

در routeهای اصلی Tenant Admin (Dashboard, Incidents, Hunting, Policies) یک دکمه Copilot وجود دارد

کلیک، پنل سمت راست را باز می‌کند

می‌توانم سؤال بنویسم

Copilot پاسخ را در قالب متن و در صورت نیاز bullet ها و لینک‌های داخلی بدهد

خروجی بر اساس داده‌های tenant من باشد، نه سایر tenant ها

US 30.1.2
به عنوان Tenant Admin
می‌خواهم روی داشبورد بپرسم: «ده کاربر پر ریسک من چه کسانی هستند و کجا باید اقدام کنم» تا Copilot از Insights و Hunting یک لیست و پیشنهاد Action برگرداند.

Acceptance:

Copilot از Insights و Hunting API ها استفاده می‌کند

لیست top N کاربران پر ریسک را نشان می‌دهد

برای هر کاربر حداقل یک لینک Action دارد:

باز کردن User detail

باز کردن Incident مرتبط

پیشنهاد اجرای Playbook

US 30.1.3
به عنوان Tenant Admin
می‌خواهم بپرسم: «در ۲۴ ساعت گذشته چه الگوی ورود مشکوکی داشته‌ایم» تا Copilot خلاصه‌ای از الگوهای sign in با ریسک یا خطای بالا بدهد.

Acceptance:

Copilot از Hunting Query API برای SignInEvents استفاده می‌کند

بر اساس time range پیش فرض (مثلا ۲۴ ساعت) خروجی را summarize می‌کند

حداقل این موارد را خلاصه می‌کند:

تعداد sign in موفق با risk بالا

تعداد fail های غیرعادی

کشورها و IPهای مشکوک

Epic 30.2 – Context aware Copilot در Incident Center

US 30.2.1
به عنوان Tenant Security Analyst
می‌خواهم وقتی روی صفحه Incident هستم، Copilot بتواند Incident را بخواند و به زبان ساده بگوید «چه شده» و چه اقدام بعدی منطقی است.

Acceptance:

در صفحه /tenant/incidents/{id} Copilot context incident را می‌گیرد:

Incident

EventLinks

EntityLinks

PlaybookRuns

پرسش: «این Incident درباره چیست»

Copilot خلاصه داستان Incident را در ۵ ۷ جمله تحویل می‌دهد

حداقل ۲ ۳ پیشنهاد Action مشخص:

اجرای Playbook X

بستن session ها

ساخت ChangeSet برای سخت‌تر کردن Policy

US 30.2.2
به عنوان Tenant Security Analyst
می‌خواهم بپرسم: «اگر این Incident را Closed کنم، چه ریسک‌هایی باقی می‌ماند» تا قبل از بستن Incident مطمئن شوم.

Acceptance:

Copilot با توجه به Incidents و Insights و Hunting مرتبط، موارد unresolved را لیست می‌کند

اگر هنوز ScheduledHuntهای مرتبط Findings دارند، اشاره می‌کند

اگر PrivilegedAccess باز یا غیر معمول وجود دارد، highlight می‌کند

Epic 30.3 – Policy و ChangeSet Explainability

US 30.3.1
به عنوان Tenant Admin
می‌خواهم روی یک Policy ABAC/RBAC بتوانم بپرسم: «این Policy دقیقا چه کار می‌کند و روی چه نوع کاربر و اپ اثر دارد» تا بدون خواندن JSON پیچیده، متوجه شوم.

Acceptance:

در صفحه Policy detail یک دکمه “Ask Copilot” وجود دارد

Copilot Policy تعریف شده را می‌گیرد (rules, conditions, targets)

توضیح انسانی قابل فهم می‌دهد:

کدام گروه کاربران

کدام اپ‌ها

چه شرایط اضافه‌ای

اگر Hunting/Simulation وجود دارد، به آن اشاره می‌کند

US 30.3.2
به عنوان Tenant Admin
می‌خواهم روی یک ChangeSet که در Phase 27 وجود دارد بپرسم: «این ChangeSet دقیقا قرار است چه چیزی را عوض کند و روی چه کاربرانی اثر دارد» تا قبل از Approve تصمیم بگیرم.

Acceptance:

Copilot ChangeItems و SimulationSummary را می‌خواند

خروجی:

خلاصه تغییرات اصلی

لیست high impact changes

توصیف تقریبی user و app هایی که تحت تاثیر قرار می‌گیرند

با یک جمله وضعیت ریسک را Label می‌کند (مثلا «این تغییر به طور کلی ریسک را کاهش می‌دهد»)

Epic 30.4 – Copilot برای پیشنهاد Automation و Hunt

US 30.4.1
به عنوان Tenant Security Officer
می‌خواهم به Copilot بگویم: «برو یک Playbook بساز که وقتی HighRiskSignIn دیدی و کاربر MFA ندارد، session را kill کند و MFA را اجباری کند» تا Copilot یک AutomationWorkflow پیشنهادی ایجاد کند.

Acceptance:

Copilot متن درخواست را می‌گیرد

یک AutomationWorkflow پیشنهادی می‌سازد:

Trigger

Conditions

Actions

آن را به صورت draft (disabled) در Automation module ایجاد می‌کند

در UI لینک “مشاهده و تایید Workflow” نشان می‌دهد

US 30.4.2
به عنوان Tenant Security Analyst
می‌خواهم بگویم: «یک Hunt بساز که هر روز ساعت ۹ صبح به دنبال الگوهای X بگردد» تا Copilot برای من SavedQuery و ScheduledHunt ایجاد کند.

Acceptance:

Copilot متن را به OQL و ScheduledHunt تبدیل می‌کند

یک SavedQuery + ScheduledHunt draft می‌سازد

لینک “مشاهده و ویرایش Hunt” را برمی‌گرداند

4. Dev Tasks سطح Backend
4.1 ماژول جدید Copilot

[B30.1] ایجاد پروژه و لایه‌ها برای Onesign.Modules.Copilot

Domain

Application

Infrastructure

API

[B30.2] تعریف DTOها و مدل‌ها:

CopilotQueryRequest

ScopeType (Tenant, Global)

TenantId

ContextType (Dashboard, Incident, Policy, ChangeSet, Hunting, Automation, Generic)

ContextId (optional)

Message (string)

Locale (e.g. "en", "fa")

CopilotQueryResponse

AnswerText (string, markdown allowed)

SuggestedActions []:

Type (OpenIncident, OpenUser, OpenApp, RunPlaybook, OpenChangeSet, OpenHunt, CreateAutomationDraft, CreateHuntDraft)

Parameters (JSON)

[B30.3] سرویس ICopilotContextBuilder

ورودی: ContextType, ContextId, TenantId

خروجی: یک context object شامل داده‌های خلاصه شده:

برای Dashboard: top risks, counts

برای Incident: Incident, Events, Entities, Playbooks

برای Policy: policy definition + sample matches

برای ChangeSet: ChangeItems + SimulationSummary

برای Hunting/Automation: وضعیت فعلی

[B30.4] سرویس ICopilotOrchestrator

وظیفه:

گرفتن CopilotQueryRequest

ساخت context از ICopilotContextBuilder

ساخت prompt ساختاری برای LLM یا AI backend

مپ کردن جواب AI به CopilotQueryResponse

این لایه vendor agnostic باشد تا به هر LLM که هست وصل شود (پروژه تو نباید مستقیم به OpenAI یا هرچیز خاص بدوزد)

[B30.5] Endpointها:

POST /api/tenant/copilot/query

دریافت CopilotQueryRequest

اعتبارسنجی tenant scope

صدا زدن ICopilotOrchestrator

برگرداندن CopilotQueryResponse

POST /api/global/copilot/query

مشابه اما برای Global Admin

اجازه cross tenant context با محدودیت

[B30.6] Action Mapping برای:

CreateAutomationDraft

ساخت AutomationWorkflow جدید در حالت disabled با داده Config که AI پیشنهاد داده

CreateHuntDraft

ساخت SavedQuery و ScheduledHunt draft در Hunting module

Open*

فقط تولید URL / link، بدون اثر جانبی

5. Dev Tasks سطح Frontend
5.1 Copilot Panel در Tenant Admin

[F30.1] اضافه کردن Copilot toggle در Layout Tenant Admin

یک دکمه ثابت در گوشه UI برای باز و بسته کردن پنل Copilot

[F30.2] پیاده سازی Copilot Sidebar Component

Chat UI ساده:

history پیام‌ها

bubble برای user و Copilot

حالت loading و error

استفاده از i18n برای همه label ها

[F30.3] ارسال context صحیح:

در Dashboard: ContextType = Dashboard

در Incident detail: ContextType = Incident و ContextId = IncidentId

در صفحه Policy: ContextType = Policy و ContextId = PolicyId

در صفحه ChangeSet: ContextType = ChangeSet و ContextId = ChangeSetId

[F30.4] رندر SuggestedActions

اگر ActionType = OpenIncident → دکمه که route را باز کند

اگر ActionType = CreateAutomationDraft → بعد از click، redirect به Automation workflow draft

اگر ActionType = CreateHuntDraft → redirect به صفحه edit SavedQuery / ScheduledHunt

5.2 Copilot Panel در Global Admin

[F30.5] نسخه Global Copilot

route های Global context را پاس دهد

Tenant filter را در صورت نیاز به Copilot منتقل کند

6. Cross cutting و Quality

[Q30.1] Permission checks

فقط نقش‌های مجاز بتوانند Copilot را صدا بزنند

Copilot tenant context را بر اساس claims تعیین کند

[Q30.2] Logging

لاگ کردن استفاده از Copilot (بدون لاگ کردن متن کامل سؤال اگر حساس است، یا حداقل mask)

[Q30.3] Tests

Unit test برای ContextBuilder هر context

Unit test برای mapping SuggestedActions و ایجاد drafts در Automation / Hunting

Basic integration برای /api/tenant/copilot/query با context Incident و Policy

اگر بخواهم خلاصه رک بگم:
فاز ۳۰ اگر به یک چت‌بات احمق تبدیل شود که هیچ داده‌ای را واقعا استفاده نمی‌کند، عملا آشغال است. این سند عمدا Copilot را به داده های واقعی (Insights, Hunting, Incidents, ChangeSets, Automation) دوخته که مجبور شوی چیزی بسازی که واقعا در عملیات به درد بخورد، نه یک “AI” شیک روی UI.
