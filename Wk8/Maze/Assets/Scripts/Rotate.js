#pragma strict

function Start () {

}

function Update () {
    transform.Rotate(Vector3(0,1,0), 180*Time.deltaTime);
}