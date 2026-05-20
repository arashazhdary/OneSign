{{- define "onesign.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "onesign.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "onesign.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "onesign.labels" -}}
app.kubernetes.io/name: {{ include "onesign.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
