<?php
require 'vendor/autoload.php';
include("common.php");
$collection = (new MongoDB\Client)->Novels->Summary;

if (getPost($_POST["title"]) != "" ) {
    $books = $collection->find(["title" => strtoupper(getPost($_POST["title"]))]);
    foreach ($books as $document) {
        if ($document["language"] == getPost($_POST["lang"]))
            die($document['_id']);
    }
    echo ('N/A');
}