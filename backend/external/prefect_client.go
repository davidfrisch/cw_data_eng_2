package external

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

var client = &http.Client{}

type Deployment struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func CreateFlowRun(deploymentId string, parameters map[string]interface{}) (string, error) {
	parametersJson, err := json.Marshal(parameters)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("/deployments/%s/create_flow_run", deploymentId)
	jsonStr := []byte(fmt.Sprintf(`{"parameters": %s}`, parametersJson))
	body, err := makeRequest("POST", url, jsonStr)
	if err != nil {
		return "", err
	}

	flowRun := map[string]interface{}{}
	err = json.Unmarshal(body, &flowRun)
	if err != nil {
		return "", err
	}



	return flowRun["id"].(string), nil
}

func GetFlowRunInfo(flowRunId string) (map[string]interface{}, error) {
	url := fmt.Sprintf("/flow_runs/%s", flowRunId)
	body, err := makeRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	flowRun := map[string]interface{}{}
	err = json.Unmarshal(body, &flowRun)
	if err != nil {
		return nil, err
	}

	return flowRun, nil
}

func GetDeploymentIdByName(name string) (string, error) {
	body, err := makeRequest("POST", "/deployments/filter", nil)
	if err != nil {
		return "", err
	}

	deployments := []Deployment{}
	err = json.Unmarshal(body, &deployments)

	if err != nil {
		return "", err
	}

	for _, deployment := range deployments {
		if deployment.Name == name {
			return deployment.Id, nil
		}
	}

	return "", nil

}

func makeRequest(method string, endpoint string, body []byte) ([]byte, error) {
	url := "http://ec2-35-178-107-122.eu-west-2.compute.amazonaws.com/api" + endpoint
	req, err := http.NewRequest(method, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json") // set headers if needed

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return responseBody, nil
}
