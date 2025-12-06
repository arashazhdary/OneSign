Get-ChildItem -Path "src" -Recurse -Filter "*.csproj" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'MediatR.*Version="13\.1\.0"') {
        $newContent = $content -replace 'MediatR.*Version="13\.1\.0"', 'MediatR" Version="14.0.0"'
        Set-Content $_.FullName $newContent -Encoding UTF8
        Write-Host "Updated: $($_.FullName)"
    }
}
