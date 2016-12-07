using UnityEngine;
using System.Collections;

public class Movement : MonoBehaviour {

	public float moveSpeed, jumpHeight, groundCheckRadius;
	public Transform groundCheck;
	public LayerMask whatIsGround;
	private bool grounded, doubleJumped;

	// Use this for initialization
	void Start () {
	
	}

	void FixedUpdate () 
	{
		grounded = Physics2D.OverlapCircle (groundCheck.position, groundCheckRadius, whatIsGround);
	}
	
	// Update is called once per frame
	void Update () {

		if (grounded)
			doubleJumped = false;
	
		if (Input.GetKeyDown (KeyCode.Space) && grounded) 
		{
			//GetComponent<Rigidbody2D> ().velocity = new Vector2 (0, jumpHeight);
			Jump();
		}

		if (Input.GetKeyDown (KeyCode.Space) && !doubleJumped && !grounded) 
		{
			//GetComponent<Rigidbody2D> ().velocity = new Vector2 (0, jumpHeight);
			Jump();
			doubleJumped = true; 
		}

		if (Input.GetKey (KeyCode.D)) 
		{
			GetComponent<Rigidbody2D> ().velocity = new Vector2 (moveSpeed, GetComponent<Rigidbody2D> ().velocity.y);
		}

		if (Input.GetKey (KeyCode.A)) 
		{
			GetComponent<Rigidbody2D> ().velocity = new Vector2 (-moveSpeed, GetComponent<Rigidbody2D> ().velocity.y);
		}
	}

	public void Jump()
	{
		GetComponent<Rigidbody2D> ().velocity = new Vector2 (0, jumpHeight);
	}
}
