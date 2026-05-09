$books = @('B001','B002','B003','B004','B005','B006','B007','B008')
foreach ($bookId in $books) {
  try {
    $r = Invoke-RestMethod -Uri "https://lbbs-backend.onrender.com/api/books/$bookId/reset-availability" -Method POST -TimeoutSec 20
    Write-Host "Reset $bookId - $($r.title): $($r.availableCopies)/$($r.totalCopies) available"
  } catch {
    Write-Host "Failed $bookId : $($_.Exception.Message)"
  }
}
Write-Host "Done."
