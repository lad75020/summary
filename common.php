<?php
function getPost($value){
    if (isset($value) && !empty($value))
        return strip_tags($value);
    else
        return "";
}