package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
)

const (
	clientID     = "YOUR_CLIENT_ID"
	clientSecret = "YOUR_CLIENT_SECRET"
	redirectURI  = "https://localhost:8080/oauth/callback"
)

func oauthCallbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Missing code", http.StatusBadRequest)
		return 
	}

	// Exchange the authorization code for an access token
	token, err := getAccessToken(code)
	if err != nil {
		http.Error(w, "Failed to get access token", http.StatusInternalServerError)
		return
	}

	// Fetch data using the access token
	data, err := fetch42Data(token)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}

	// Display the data
	fmt.Fprint(w, string(data))
}

func getAccessToken(code string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)

	resp, err := http.PostForm("https://api.intra.42.fr/oauth/token", data)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var tokenResponse struct {
		AccessToken string `json:"access_token"`
	}

	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return "", err
	}

	return tokenResponse.AccessToken, nil
}

func fetch42Data(token string) ([]byte, error) {
	req, err := http.NewRequest("GET", "https://api.intra.42.fr/v2/me", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return ioutil.ReadAll(resp.Body)
}
