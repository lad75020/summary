<?php
$title="";
if (isset($_POST['title']) && $_POST['title'] != "")
    $title= $_POST['title'];

echo(apcu_fetch(strtoupper($title)));