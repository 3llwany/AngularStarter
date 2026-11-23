# Authentication feature

Optional user-facing sign-in, registration, and recovery pages belong here. Session restoration and the signed-in/anonymous state live in `core/auth`; page layouts and validation stay feature-owned.

The current starter includes the auth route and service seams, plus an in-memory demo provider. Add real screens and connect the HTTP provider when a project needs authentication. The generic guards distinguish authenticated users from guests only; they do not implement authorization policies.
