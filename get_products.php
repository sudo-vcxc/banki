<?php
header('Content-Type: application/json; charset=utf-8');

$conn = new mysqli("localhost", "root", "", "viragok");
if ($conn->connect_error) {
    echo json_encode(["error" => "Adatbázis kapcsolat sikertelen"]);
    exit;
}
$conn->set_charset("utf8");

$sql = "SELECT id, nev, ar, valuta, keszlet FROM viragok";
$result = $conn->query($sql);

$termekek = [];
while ($row = $result->fetch_assoc()) {
    $termekek[] = $row;
}

// fontos: csomagoljuk be a 'termekek' kulcs alá
echo json_encode(["termekek" => $termekek], JSON_UNESCAPED_UNICODE);
?>
