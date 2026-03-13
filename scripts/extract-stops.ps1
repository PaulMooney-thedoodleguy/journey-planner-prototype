Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'C:\Users\Paul.mooney\Documents\AI Dev\Journey Planner Prototype\Resources\itm_all_gtfs.zip'
$outPath = 'C:\Users\Paul.mooney\Documents\AI Dev\Journey Planner Prototype\scripts\gtfs-tmp\stops.txt'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.Entries | Where-Object { $_.Name -eq 'stops.txt' }
Write-Host "Found: $($entry.Name) uncompressed: $($entry.Length) bytes"
[System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $outPath, $true)
$zip.Dispose()
Write-Host 'Done'
