import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "https://travel-path-psi.vercel.app";

function TravelGraph({ graphData, selected }) {
  const nodes = graphData?.nodes || [];
  const links = graphData?.links || [];

  const mainDestination =
    nodes.find(
      (node) =>
        node.type === "Destination" &&
        (node.label === selected || node.name === selected)
    ) || nodes.find((node) => node.type === "Destination");

  if (!mainDestination) {
    return (
      <div className="graph-message">
        <div className="big-graph-icon">✈</div>
        <h3>Your travel graph will appear here</h3>
        <p>Select a destination and click Explore.</p>
      </div>
    );
  }

  const getNode = (id) => nodes.find((node) => node.id === id);

  const relatedConnections = [];

  links.forEach((link) => {
    const source = getNode(link.source);
    const target = getNode(link.target);

    if (!source || !target) return;

    let otherNode = null;

    if (source.id === mainDestination.id) {
      otherNode = target;
    } else if (target.id === mainDestination.id) {
      otherNode = source;
    }

    if (!otherNode) return;

    relatedConnections.push({
      node: otherNode,
      relationship: formatRelationship(link.relationship)
    });
  });

  const uniqueConnections = [];
  const seen = new Set();

  relatedConnections.forEach((connection) => {
    const key = `${connection.node.id}-${connection.relationship}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueConnections.push(connection);
    }
  });

  const destinationConnections = uniqueConnections.filter(
    (connection) => connection.node.type === "Destination"
  );

  const attractionConnections = uniqueConnections.filter(
    (connection) => connection.node.type === "Attraction"
  );

  const interestConnections = uniqueConnections.filter(
    (connection) => connection.node.type === "Interest"
  );

  const totalConnections = uniqueConnections.length;

  const getIcon = (type) => {
    if (type === "Destination") return "✈";
    if (type === "Attraction") return "⌂";
    if (type === "Interest") return "★";
    return "•";
  };

  const getClass = (type) => {
    if (type === "Destination") return "destination";
    if (type === "Attraction") return "attraction";
    if (type === "Interest") return "interest";
    return "default";
  };

  const NodeCard = ({ node, main = false }) => {
    const label = node.label || node.name || "Unknown";

    return (
      <div
        className={`travel-node ${getClass(node.type)} ${
          main ? "main-node" : ""
        }`}
      >
        <div className="travel-node-icon">
          {getIcon(node.type)}
        </div>

        <div className="travel-node-content">
          <strong>{label}</strong>
          <span>{node.type}</span>
        </div>
      </div>
    );
  };

  const RelationshipRow = ({ connection, direction }) => {
    return (
      <div className="relationship-row">
        {direction === "left" ? (
          <>
            <NodeCard node={connection.node} />

            <div className="relationship-connector left">
              <div className="connector-line"></div>
              <span>{connection.relationship}</span>
              <div className="connector-arrow">→</div>
            </div>
          </>
        ) : (
          <>
            <div className="relationship-connector right">
              <div className="connector-arrow">→</div>
              <div className="connector-line"></div>
              <span>{connection.relationship}</span>
            </div>

            <NodeCard node={connection.node} />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="clean-graph">
      <div className="graph-top">
        <div>
          <span className="graph-overline">TRAVELPATH GRAPH</span>

          <h3>
            {mainDestination.label || mainDestination.name}
          </h3>

          <p>Explore connections around this destination</p>
        </div>

        <div className="connection-count">
          <strong>{totalConnections}</strong>
          <span>connections</span>
        </div>
      </div>

      <div className="graph-layout">
        <div className="graph-column left-column">
          <div className="column-title">
            <span className="column-icon purple">📍</span>

            <div>
              <strong>Nearby destinations</strong>
              <small>Connected places</small>
            </div>
          </div>

          {destinationConnections.length > 0 ? (
            <div className="relationship-list">
              {destinationConnections.map((connection, index) => (
                <RelationshipRow
                  key={`${connection.node.id}-${index}`}
                  connection={connection}
                  direction="left"
                />
              ))}
            </div>
          ) : (
            <div className="no-connections">
              No connected destinations
            </div>
          )}
        </div>

        <div className="graph-center">
          <NodeCard node={mainDestination} main={true} />

          <div className="center-label">
            SELECTED DESTINATION
          </div>
        </div>

        <div className="graph-column right-column">
          <div className="column-title">
            <span className="column-icon blue">🏛</span>

            <div>
              <strong>Attractions</strong>
              <small>Places to explore</small>
            </div>
          </div>

          {attractionConnections.length > 0 ? (
            <div className="relationship-list">
              {attractionConnections.map((connection, index) => (
                <RelationshipRow
                  key={`${connection.node.id}-${index}`}
                  connection={connection}
                  direction="right"
                />
              ))}
            </div>
          ) : (
            <div className="no-connections">
              No attractions found
            </div>
          )}

          <div className="column-title interests-title">
            <span className="column-icon green">★</span>

            <div>
              <strong>Interests</strong>
              <small>Travel themes</small>
            </div>
          </div>

          {interestConnections.length > 0 ? (
            <div className="relationship-list">
              {interestConnections.map((connection, index) => (
                <RelationshipRow
                  key={`${connection.node.id}-${index}`}
                  connection={connection}
                  direction="right"
                />
              ))}
            </div>
          ) : (
            <div className="no-connections">
              No interests found
            </div>
          )}
        </div>
      </div>

      <div className="graph-footer">
        <div className="legend-item">
          <span className="legend-circle purple"></span>
          Destination
        </div>

        <div className="legend-item">
          <span className="legend-circle blue"></span>
          Attraction
        </div>

        <div className="legend-item">
          <span className="legend-circle green"></span>
          Interest
        </div>

        <div className="graph-powered">
          Graph relationships powered by CognoDB
        </div>
      </div>
    </div>
  );
}

function formatRelationship(relationship) {
  if (!relationship) return "connected";

  return String(relationship)
    .replaceAll("_", " ")
    .toLowerCase();
}

function App() {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState("");
  const [results, setResults] = useState([]);
  const [graphData, setGraphData] = useState({
    nodes: [],
    links: []
  });
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const response = await fetch(
          `${API}/api/destinations`
        );

        if (!response.ok) {
          throw new Error("Failed to load destinations");
        }

        const data = await response.json();

        setDestinations(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error("Destination error:", error);

        setError(
          "Could not connect to TravelPath server."
        );
      }
    };

    loadDestinations();
  }, []);

  const explore = async () => {
    if (!selected) return;

    setLoading(true);
    setGraphLoading(true);
    setError("");

    try {
      const [exploreResponse, graphResponse] =
        await Promise.all([
          fetch(
            `${API}/api/explore/${encodeURIComponent(
              selected
            )}`
          ),
          fetch(`${API}/api/graph`)
        ]);

      if (!exploreResponse.ok) {
        throw new Error("Explore API failed");
      }

      if (!graphResponse.ok) {
        throw new Error("Graph API failed");
      }

      const exploreData =
        await exploreResponse.json();

      const graph =
        await graphResponse.json();

      setResults(
        Array.isArray(exploreData)
          ? exploreData
          : []
      );

      setGraphData({
        nodes: Array.isArray(graph.nodes)
          ? graph.nodes
          : [],
        links: Array.isArray(graph.links)
          ? graph.links
          : []
      });
    } catch (error) {
      console.error("Explore error:", error);

      setResults([]);

      setGraphData({
        nodes: [],
        links: []
      });

      setError(
        "Could not load travel connections. Please check the server."
      );
    } finally {
      setLoading(false);
      setGraphLoading(false);
    }
  };

  const handleDestinationChange = (event) => {
    const value = event.target.value;

    setSelected(value);
    setResults([]);

    setGraphData({
      nodes: [],
      links: []
    });

    setError("");
  };

  const attractionCount = useMemo(() => {
    return graphData.nodes.filter(
      (node) => node.type === "Attraction"
    ).length;
  }, [graphData.nodes]);

  const interestCount = useMemo(() => {
    return graphData.nodes.filter(
      (node) => node.type === "Interest"
    ).length;
  }, [graphData.nodes]);

  const connectionCount = useMemo(() => {
    if (!selected) return 0;

    const selectedNode = graphData.nodes.find(
      (node) =>
        node.type === "Destination" &&
        (node.label === selected ||
          node.name === selected)
    );

    if (!selectedNode) return 0;

    return graphData.links.filter(
      (link) =>
        link.source === selectedNode.id ||
        link.target === selectedNode.id
    ).length;
  }, [graphData, selected]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✈</div>

          <div>
            <h2>TravelPath</h2>
            <p>Explore. Connect. Discover.</p>
          </div>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          CognoDB Connected
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              GRAPH-BASED TRAVEL DISCOVERY
            </div>

            <h1>
              Discover places through
              <span>connections.</span>
            </h1>

            <p>
              Explore destinations, attractions and
              interests connected through a knowledge
              graph powered by CognoDB.
            </p>

            <div className="search-box">
              <select
                value={selected}
                onChange={handleDestinationChange}
              >
                <option value="">
                  Choose a destination
                </option>

                {destinations.map((place) => (
                  <option
                    key={place.name}
                    value={place.name}
                  >
                    {place.name}, {place.country}
                  </option>
                ))}
              </select>

              <button
                className="explore-btn"
                onClick={explore}
                disabled={!selected || loading}
              >
                {loading
                  ? "Exploring..."
                  : "Explore →"}
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="content-grid">
          <div className="panel destinations-panel">
            <div className="panel-heading">
              <div>
                <h2>Connected Destinations</h2>

                <p>
                  Places connected to your selected
                  destination
                </p>
              </div>

              {selected && (
                <div className="graph-badge">
                  {selected}
                </div>
              )}
            </div>

            {loading && (
              <div className="state">
                <div className="loader"></div>
                Finding connected places...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🌍</div>

                <h3>Start exploring</h3>

                <p>
                  Choose a destination above to
                  discover connected places.
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="destination-list">
                {results.map((place, index) => (
                  <div
                    className="destination-card"
                    key={
                      place.destination || index
                    }
                  >
                    <div className="destination-icon">
                      📍
                    </div>

                    <div className="destination-info">
                      <h3>
                        {place.destination}
                      </h3>

                      {place.attractions &&
                        place.attractions.length > 0 && (
                          <div className="card-section">
                            <span className="label">
                              🏛 Attractions
                            </span>

                            <div className="tags">
                              {place.attractions.map(
                                (item) => (
                                  <span
                                    className="tag purple"
                                    key={item}
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {place.interests &&
                        place.interests.length > 0 && (
                          <div className="card-section">
                            <span className="label">
                              ✦ Interests
                            </span>

                            <div className="tags">
                              {place.interests.map(
                                (item) => (
                                  <span
                                    className="tag green"
                                    key={item}
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel graph-panel">
            <div className="panel-heading">
              <div>
                <h2>Relationship Graph</h2>

                <p>
                  See how this destination connects
                  to places and interests
                </p>
              </div>

              {selected && (
                <div className="graph-badge">
                  {selected}
                </div>
              )}
            </div>

            <div className="graph-container">
              {graphLoading && (
                <div className="graph-message">
                  <div className="loader"></div>

                  <h3>
                    Building travel graph...
                  </h3>

                  <p>
                    Finding relationships
                  </p>
                </div>
              )}

              {!graphLoading &&
                graphData.nodes.length === 0 && (
                  <div className="graph-message">
                    <div className="big-graph-icon">
                      ✈
                    </div>

                    <h3>
                      Explore a destination
                    </h3>

                    <p>
                      Your relationship graph will
                      appear here.
                    </p>
                  </div>
                )}

              {!graphLoading &&
                graphData.nodes.length > 0 && (
                  <TravelGraph
                    graphData={graphData}
                    selected={selected}
                  />
                )}
            </div>
          </div>
        </section>

        <section className="how-section">
          <div className="section-title">
            <span>HOW TRAVELPATH WORKS</span>

            <h2>
              Travel discovery through relationships
            </h2>
          </div>

          <div className="how-grid">
            <div className="how-card">
              <div className="how-number">01</div>

              <div className="how-icon">📍</div>

              <h3>Choose a destination</h3>

              <p>
                Start with a destination and
                discover places connected to it.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">02</div>

              <div className="how-icon">🔗</div>

              <h3>Follow connections</h3>

              <p>
                TravelPath follows relationships
                stored in the CognoDB graph.
              </p>
            </div>

            <div className="how-card">
              <div className="how-number">03</div>

              <div className="how-icon">✨</div>

              <h3>Discover possibilities</h3>

              <p>
                Explore connected destinations,
                attractions and travel interests.
              </p>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon purple-icon">
              📍
            </span>

            <div>
              <strong>
                {destinations.length}
              </strong>

              <p>Destinations</p>

              <small>Connected places</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon blue-icon">
              🏛
            </span>

            <div>
              <strong>
                {attractionCount}
              </strong>

              <p>Attractions</p>

              <small>Points of interest</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon green-icon">
              ✦
            </span>

            <div>
              <strong>
                {interestCount}
              </strong>

              <p>Interests</p>

              <small>Travel themes</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon orange-icon">
              🔗
            </span>

            <div>
              <strong>
                {connectionCount}
              </strong>

              <p>Connections</p>

              <small>Graph relationships</small>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div>TravelPath</div>

        <span>
          Graph-powered travel discovery • CognoDB
        </span>
      </footer>
    </div>
  );
}

export default App;