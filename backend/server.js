const express = require("express");
const cors = require("cors");
require("dotenv").config();

const driver = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "TravelPath API is running"
  });
});

app.get("/api/destinations", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (d:Destination)
      RETURN
        d.name AS name,
        d.country AS country
      ORDER BY d.name
    `);

    const destinations = result.records.map((record) => ({
      name: record.get("name"),
      country: record.get("country")
    }));

    res.json(destinations);
  } catch (error) {
    console.error("Destinations error:", error);

    res.status(500).json({
      error: "Could not load destinations"
    });
  } finally {
    await session.close();
  }
});

app.get("/api/explore/:name", async (req, res) => {
  const session = driver.session();
  const name = req.params.name;

  console.log(`Exploring destination: ${name}`);

  try {
    const result = await session.run(
      `
      MATCH (d:Destination {name: $name})

      OPTIONAL MATCH
        (d)-[:CONNECTED_TO]-(related:Destination)

      OPTIONAL MATCH
        (related)-[:HAS_ATTRACTION]->(a:Attraction)

      OPTIONAL MATCH
        (related)-[:HAS_INTEREST]->(i:Interest)

      RETURN
        related.name AS destination,
        collect(DISTINCT a.name) AS attractions,
        collect(DISTINCT i.name) AS interests
      `,
      {
        name
      }
    );

    const data = result.records
      .filter(
        (record) => record.get("destination") !== null
      )
      .map((record) => ({
        destination: record.get("destination"),
        attractions: record.get("attractions") || [],
        interests: record.get("interests") || []
      }));

    console.log(
      `Found ${data.length} connected destinations`
    );

    res.json(data);
  } catch (error) {
    console.error("Explore error:", error);

    res.status(500).json({
      error: "Could not explore destination",
      details: error.message
    });
  } finally {
    await session.close();
  }
});

app.get("/api/graph", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (n)-[r]->(m)

      RETURN
        elementId(n) AS sourceId,
        elementId(m) AS targetId,
        n.name AS sourceName,
        m.name AS targetName,
        labels(n)[0] AS sourceType,
        labels(m)[0] AS targetType,
        type(r) AS relationship
    `);

    const nodes = new Map();
    const links = [];

    result.records.forEach((record) => {
      const sourceId = record.get("sourceId");
      const targetId = record.get("targetId");

      const sourceName = record.get("sourceName");
      const targetName = record.get("targetName");

      const sourceType = record.get("sourceType");
      const targetType = record.get("targetType");

      nodes.set(sourceId, {
        id: sourceId,
        label: sourceName,
        name: sourceName,
        type: sourceType
      });

      nodes.set(targetId, {
        id: targetId,
        label: targetName,
        name: targetName,
        type: targetType
      });

      links.push({
        source: sourceId,
        target: targetId,
        relationship: record.get("relationship")
      });
    });

    const graph = {
      nodes: Array.from(nodes.values()),
      links
    };

    console.log(
      `Graph: ${graph.nodes.length} nodes, ${graph.links.length} relationships`
    );

    res.json(graph);
  } catch (error) {
    console.error("Graph error:", error);

    res.status(500).json({
      error: "Could not load graph",
      details: error.message
    });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(
    `TravelPath server running on port ${PORT}`
  );

  try {
    const session = driver.session();

    await session.run("RETURN 1");

    await session.close();

    console.log("Connected to CognoDB");
  } catch (error) {
    console.error(
      "CognoDB connection failed:",
      error.message
    );
  }
});