# TravelPath
TravelPath — Graph-based travel discovery application built for the Wexa AI CognoDB Take-Home Assignment. Uses CognoDB and Neo4j drivers to model and explore relationships between destinations, attractions, and travel interests.

### Wexa AI — CognoDB Take-Home Assignment

TravelPath is a graph-based travel discovery application developed as part of the **Wexa AI CognoDB Take-Home Assignment**.

The application uses **CognoDB** as the graph database layer to model relationships between destinations, attractions, and travel interests. Users can select a destination and explore its connected places and interests through an interactive graph-based interface.

## 🚀 Live Demo

[Add your deployed demo link here]

## 🎥 Demo Video

[Add your screen recording link here]

## 🛠️ Tech Stack

- React + Vite
- Node.js
- Express.js
- CognoDB
- Neo4j JavaScript Driver
- Cypher / openCypher
- CSS

## ✨ Features

- Explore destinations through a graph-based interface
- Discover connected destinations
- Explore attractions associated with destinations
- Discover travel interests and themes
- Visualize relationships in an interactive graph
- Graph-based multi-hop relationship exploration
- Loading, empty and error states
- Environment-based database configuration
- Responsive and clean user interface

## 🗺️ Use Case

Travel information is naturally interconnected. A destination can be connected to other destinations, attractions, interests, and travel themes.

TravelPath represents these connections as a graph, allowing users to explore relationships rather than simply browsing independent destination records.

## 🧠 Why a Graph Database?

A graph database is well suited for TravelPath because the core of the application is based on **relationships between entities**.

Instead of treating destinations, attractions and interests as separate tables, TravelPath represents them as connected nodes:

```text
Destination
     │
     ├── CONNECTED_TO ──→ Destination
     │
     ├── HAS_ATTRACTION ──→ Attraction
     │
     └── HAS_INTEREST ──→ Interest
