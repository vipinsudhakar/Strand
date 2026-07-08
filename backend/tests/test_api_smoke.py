CLIENT_A = {"X-Client-Id": "client-a"}
CLIENT_B = {"X-Client-Id": "client-b"}


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_sample_endpoints(client):
    prot = client.get("/api/protein/samples").json()
    dna = client.get("/api/dna/samples").json()
    assert len(prot) == 6
    assert len(dna) == 4
    assert {"key", "label", "sequence"} <= prot[0].keys()


def test_protein_analyze_requires_client_id(client):
    seq = client.get("/api/protein/samples").json()[2]["sequence"]
    assert client.post("/api/protein/analyze", json={"sequence": seq}).status_code == 400
    r = client.post("/api/protein/analyze", json={"sequence": seq}, headers=CLIENT_A)
    assert r.status_code == 201
    assert r.json()["id"] > 0


def test_dna_analyze_and_history_scoping(client):
    seq = client.get("/api/dna/samples").json()[0]["sequence"]
    created = client.post("/api/dna/analyze", json={"sequence": seq}, headers=CLIENT_A)
    assert created.status_code == 201
    new_id = created.json()["id"]

    # client-a sees its row; client-b sees none of a's rows.
    assert len(client.get("/api/dna/history", headers=CLIENT_A).json()) >= 1
    assert client.get("/api/dna/history", headers=CLIENT_B).json() == []

    # client-b cannot read client-a's specific row.
    assert client.get(f"/api/dna/history/{new_id}", headers=CLIENT_B).status_code == 404
    assert client.get(f"/api/dna/history/{new_id}", headers=CLIENT_A).status_code == 200


def test_invalid_inputs_return_400(client):
    assert (
        client.post("/api/protein/analyze", json={"sequence": "MA"}, headers=CLIENT_A).status_code
        == 400
    )
    assert (
        client.post("/api/dna/analyze", json={"sequence": "ATCGZ"}, headers=CLIENT_A).status_code
        == 400
    )
