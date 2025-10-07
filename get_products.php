<?php
header('Content-Type: application/json; charset=utf-8');

$conn = new mysqli("localhost", "root", "", "viragbolt");
if ($conn->connect_error) {
    echo json_encode(["error" => "Adatbázis kapcsolat sikertelen"]);
    exit;
}
$conn->set_charset("utf8");

$sql = "SELECT id, nev, ar, valuta, keszlet FROM viragok";
$result = $conn->query($sql);

$termekek = [];
while($row = $result->fetch_assoc()) {
    $termekek[] = $row;
}

echo json_encode($termekek, JSON_UNESCAPED_UNICODE);
?>