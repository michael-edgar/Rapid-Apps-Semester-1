using UnityEngine;
using System.Collections;

public class Bacon : MonoBehaviour {

	private float baconCount=0;
	public LevelManager levelManager;
	public GameObject nextCheckpoint, currentCheckpoint;
	public Transform Player;

	// Use this for initialization
	void Start () 
	{
		levelManager = FindObjectOfType<LevelManager> ();
	}
	
	// Update is called once per frame
	void Update () 
	{
		if (baconCount == 3) 
		{
			Player.transform.position = nextCheckpoint.transform.position;
			baconCount = 0;
			currentCheckpoint = nextCheckpoint;
		}
	}

	void OnTriggerEnter2D(Collider2D other)
	{
		if (other.name == "Player") 
		{
			baconCount= (baconCount + 1);
		}
	}

}
