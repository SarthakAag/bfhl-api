# BFHL Tree Visualizer

A full-stack web application that processes hierarchical node relationships and visualizes them as trees.

Built as part of the **SRM Full Stack Engineering Challenge**.

## Features

* Accepts node input like: `A->B, A->C, B->D`
* Builds hierarchical tree structures
* Detects cycles in graphs
* Identifies invalid inputs
* Handles duplicate edges
* Displays summary statistics
* Clean and responsive UI

## Tech Stack

* **Frontend:** Next.js (React)
* **Backend:** Next.js API Routes
* **Styling:** Custom CSS
* **Deployment:** Vercel

## API Endpoint

### `POST /api/bfhl`

#### Request

json
{
  "data": ["A->B", "A->C", "B->D"]
}

#### Response

json
{
  "user_id": "sarthakagarwal_28082004",
  "email_id": "sa9916@srmist.edu.in",
  "college_roll_number": "RA2311003040030",
  "hierarchies": [...],
  "invalid_entries": [...],
  "duplicate_edges": [...],
  "summary": {
    "total_trees": 0,
    "total_cycles": 0,
    "largest_tree_root": ""
  }
}


## Processing Rules

* Valid format: `X->Y` (uppercase letters only)
* Invalid inputs are filtered out
* Duplicate edges are tracked
* Trees are constructed from valid edges
* Cycles are detected using DFS
* Depth is calculated for non-cyclic trees


## Frontend

* Input field for node edges
* Submit button to call API
* Displays:

  * Identity info
  * Summary stats
  * Tree visualization
  * Invalid & duplicate entries


## Project Structure


/app
  /api/bfhl/route.js   # Backend API
  /page.js             # Frontend UI
/styles                # CSS


##  Run Locally

bash
npm install
npm run dev


Open: `http://localhost:3000`



## Deployment

Deployed on Vercel







**Your Name**
