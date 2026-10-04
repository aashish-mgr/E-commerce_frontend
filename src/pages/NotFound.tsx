import { useNavigate, useLocation } from "react-router-dom";
import { Compass } from "lucide-react";
import { Container } from "../Components/ui/Container";
import { Button } from "../Components/ui/Button";
import { EmptyState } from "../Components/ui/EmptyState";
import { Panel } from "../Components/ui/Panel";

/**
 * Catch-all for unmatched paths. Without it an unknown URL renders the navbar
 * over an empty outlet, which reads as a broken page rather than a missing one.
 */
export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper">
      <Container className="py-16">
        <Panel>
          <EmptyState
            icon={Compass}
            title="Page not found"
            direction={`We could not find ${pathname}. It may have moved, or the link may be out of date.`}
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary" onClick={() => navigate("/")}>
                  Back to home
                </Button>
                <Button variant="outline" onClick={() => navigate("/orders")}>
                  My orders
                </Button>
              </div>
            }
          />
        </Panel>
      </Container>
    </div>
  );
}