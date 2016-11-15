#pragma strict

function Start () {

}

function Update () {
    if (c.gameObject.tag == "Med-Pack") Destroy(c.gameObject); 
}